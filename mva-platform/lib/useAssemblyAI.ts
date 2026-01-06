import { useState, useRef } from 'react';

export function useAssemblyAI(
  onFinalTranscript: (text: string) => void,
  onPartial?: (text: string) => void
) {
  const socketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  // Store the full conversation for this session
  const sessionTranscript = useRef("");
  // Store the text of the CURRENT turn (while speaking)
  const currentTurnText = useRef("");

  // We define stop() first so start() can call it for Auto-Send
  const stop = () => {
    // 1. Stop Audio Hardware
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    // 2. Close WebSocket
    if (socketRef.current) {
      if (socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({ type: "Terminate" }));
      }
      socketRef.current.close();
      socketRef.current = null;
    }
    
    setIsRecording(false);

    // 3. Finalize & Send Text
    // Combine history + current phrase
    const finalText = (sessionTranscript.current + " " + currentTurnText.current).trim();
    
    if (finalText) {
      onFinalTranscript(finalText);
    }

    // 4. Reset Buffers for next time
    sessionTranscript.current = "";
    currentTurnText.current = "";
  };

  const start = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const tokenRes = await fetch(`${apiUrl}/api/assembly/token`);
      
      if (!tokenRes.ok) throw new Error("Failed to fetch AssemblyAI token");
      
      const { token } = await tokenRes.json();

      // Connect to EU Endpoint
      const socket = new WebSocket(
        `wss://streaming.eu.assemblyai.com/v3/ws?sample_rate=16000&token=${token}`
      );
      socketRef.current = socket;

      socket.onmessage = (msg) => {
        const data = JSON.parse(msg.data);

        // Handle V3 "Turn" Events
        if (data.type === 'Turn') {
           // FIX 1: Overwrite text to prevent stuttering (don't use +=)
           if (data.transcript) {
             currentTurnText.current = data.transcript;
           }

           // Update UI with partial text
           const fullDisplay = (sessionTranscript.current + " " + currentTurnText.current).trim();
           onPartial?.(fullDisplay);

           // FIX 2: Auto-Send on Silence (End of Turn)
           // This automatically stops recording and sends the message
           if (data.end_of_turn) {
             stop(); 
           }
        }
      };

      socket.onopen = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new AudioContext({ sampleRate: 16000 });
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        source.connect(processor);
        processor.connect(audioContext.destination);

        processor.onaudioprocess = (e) => {
          const input = e.inputBuffer.getChannelData(0);
          const pcm16 = convertFloat32ToInt16(input);
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(pcm16);
          }
        };
        
        setIsRecording(true);
      };

      socket.onerror = (err) => {
        console.error("WebSocket Error:", err);
        setIsRecording(false);
      };
      
      socket.onclose = () => {
        setIsRecording(false);
      }

    } catch (err) {
      console.error(err);
      alert("Microphone error or backend connection failed.");
      setIsRecording(false);
    }
  };

  return { start, stop, isRecording };
}

function convertFloat32ToInt16(buffer: Float32Array) {
  const pcm = new ArrayBuffer(buffer.length * 2);
  const view = new DataView(pcm);
  let offset = 0;
  for (let i = 0; i < buffer.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, buffer[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return pcm;
}