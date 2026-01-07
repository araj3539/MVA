import { useState, useRef } from 'react';

export function useAssemblyAI(
  onFinalTranscript: (text: string) => void,
  onPartial?: (text: string) => void
) {
  const socketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  // Buffers
  const sessionTranscript = useRef("");
  const currentTurnText = useRef("");

  // Helper to Stop & Send
  const stop = () => {
    // 1. Stop Audio
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    // 2. Close Socket
    if (socketRef.current) {
      if (socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({ type: "Terminate" }));
      }
      socketRef.current.close();
      socketRef.current = null;
    }
    
    setIsRecording(false);

    // 3. Finalize Text & Send
    const finalText = (sessionTranscript.current + " " + currentTurnText.current).trim();
    if (finalText) {
      onFinalTranscript(finalText);
    }

    // 4. Reset
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

        if (data.type === 'Turn') {
           // FIX: Overwrite text to prevent "i i have i have" stuttering
           if (data.transcript) {
             currentTurnText.current = data.transcript;
           }

           // Update the "Ghost Bubble" in UI
           const fullDisplay = (sessionTranscript.current + " " + currentTurnText.current).trim();
           onPartial?.(fullDisplay);

           // Auto-Send on Silence
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