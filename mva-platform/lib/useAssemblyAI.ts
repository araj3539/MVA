import { useState, useRef } from 'react';

export function useAssemblyAI(
  onFinalTranscript: (text: string) => void,
  onPartial?: (text: string) => void
) {
  const socketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  // 🔒 SIMPLIFIED BUFFER: Just keeps the latest "Truth" from the AI
  const latestTextRef = useRef("");
  const silenceTimer = useRef<NodeJS.Timeout | null>(null);

  const stop = () => {
    if (silenceTimer.current) clearTimeout(silenceTimer.current);

    // 1. Cleanup Audio & Socket
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    if (socketRef.current) {
      if (socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({ type: "Terminate" }));
      }
      socketRef.current.close();
      socketRef.current = null;
    }
    
    setIsRecording(false);

    // 2. SEND FINAL TEXT
    // We simply send whatever the latest valid text was. No appending/duplicating.
    const finalText = latestTextRef.current.trim();
    if (finalText) {
      onFinalTranscript(finalText);
    }

    // 3. Reset
    latestTextRef.current = "";
  };

  const start = async () => {
    try {
      // Clear buffer on start
      latestTextRef.current = "";

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const tokenRes = await fetch(`${apiUrl}/api/assembly/token`);
      if (!tokenRes.ok) throw new Error("Failed to fetch AssemblyAI token");
      const { token } = await tokenRes.json();

      // V3 EU Endpoint
      const socket = new WebSocket(
        `wss://streaming.eu.assemblyai.com/v3/ws?sample_rate=16000&token=${token}`
      );
      socketRef.current = socket;

      socket.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        const text = data.transcript || data.text || ""; 

        // Ignore empty updates
        if (!text) return;

        // 🛑 CORE FIX: Always update the "Latest Truth"
        // We don't append. We assume the AI gives us the best current transcription.
        latestTextRef.current = text;
        onPartial?.(text);

        // Silence Detection (1.5s)
        if (silenceTimer.current) clearTimeout(silenceTimer.current);
        
        // If it's a "Final" event, we might want to stop sooner, 
        // but for safety, we rely on the Silence Timer to trigger the send.
        if (data.type === 'FinalTranscript' || data.type === 'Turn') {
             silenceTimer.current = setTimeout(() => {
               console.log("🛑 Silence detected, sending...");
               stop(); 
             }, 1500);
        } else {
             // For partials, also set a timer (in case user just stops talking without a Final event)
             silenceTimer.current = setTimeout(() => {
               stop();
             }, 2500); // Slightly longer timeout for partials
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
            if (socket.readyState === WebSocket.OPEN) {
                const input = e.inputBuffer.getChannelData(0);
                const pcm16 = new Int16Array(input.length);
                for (let i = 0; i < input.length; i++) {
                    const s = Math.max(-1, Math.min(1, input[i]));
                    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }
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
      setIsRecording(false);
    }
  };

  return { start, stop, isRecording };
}