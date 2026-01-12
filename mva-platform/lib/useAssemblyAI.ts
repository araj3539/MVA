import { useState, useRef } from "react";

type UseAssemblyAIResult = {
  start: () => Promise<void>;
  stop: () => void;
  muteMic: () => void;
  unmuteMic: () => void;
  isRecording: boolean;
};

export function useAssemblyAI(
  onFinalTranscript: (text: string) => void,
  onPartial?: (text: string) => void
): UseAssemblyAIResult {
  const socketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioTrackRef = useRef<MediaStreamTrack | null>(null);

  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestTextRef = useRef("");

  const [isRecording, setIsRecording] = useState(false);

  // =========================
  // 🔇 PHYSICAL MIC CONTROL
  // =========================
  const muteMic = () => {
    if (audioTrackRef.current) {
      audioTrackRef.current.enabled = false;
    }
  };

  const unmuteMic = () => {
    if (audioTrackRef.current) {
      audioTrackRef.current.enabled = true;
    }
  };

  // =========================
  // ❌ STOP = END CALL ONLY
  // =========================
  const stop = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    // Send final transcript once
    const finalText = latestTextRef.current.trim();
    if (finalText) {
      onFinalTranscript(finalText);
    }

    latestTextRef.current = "";

    // Cleanup audio
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Close socket ONLY here
    if (socketRef.current) {
      if (socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: "Terminate" }));
      }
      socketRef.current.close();
      socketRef.current = null;
    }

    setIsRecording(false);
  };

  // =========================
  // ▶ START RECORDING SESSION
  // =========================
  const start = async () => {
    try {
      latestTextRef.current = "";

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const tokenRes = await fetch(`${apiUrl}/api/assembly/token`);
      if (!tokenRes.ok) {
        throw new Error("Failed to fetch AssemblyAI token");
      }

      const { token } = await tokenRes.json();

      const socket = new WebSocket(
        `wss://streaming.eu.assemblyai.com/v3/ws?sample_rate=16000&token=${token}`
      );

      socketRef.current = socket;

      socket.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        const text = data.transcript || data.text || "";

        if (!text) return;

        // Always treat latest transcript as truth
        latestTextRef.current = text;
        onPartial?.(text);

        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        // Silence detection only sends transcript
        silenceTimerRef.current = setTimeout(() => {
          const finalText = latestTextRef.current.trim();
          if (finalText) {
            onFinalTranscript(finalText);
            latestTextRef.current = "";
          }
        }, data.type === "FinalTranscript" ? 1500 : 2500);
      };

      socket.onopen = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        audioTrackRef.current = stream.getAudioTracks()[0];

        const audioContext = new AudioContext({ sampleRate: 16000 });
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        source.connect(processor);
        processor.connect(audioContext.destination);

        processor.onaudioprocess = (e) => {
          if (
            socket.readyState !== WebSocket.OPEN ||
            !audioTrackRef.current?.enabled
          ) {
            return;
          }

          const input = e.inputBuffer.getChannelData(0);
          const pcm16 = new Int16Array(input.length);

          for (let i = 0; i < input.length; i++) {
            const s = Math.max(-1, Math.min(1, input[i]));
            pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
          }

          socket.send(pcm16);
        };

        setIsRecording(true);
      };

      socket.onerror = () => {
        // Do NOT treat this as fatal unless call ends
        console.warn("ℹ️ AssemblyAI WebSocket error (non-fatal)");
      };
    } catch (err) {
      console.error("AssemblyAI start error:", err);
      setIsRecording(false);
    }
  };

  return {
    start,
    stop, // ONLY call on call end
    muteMic,
    unmuteMic,
    isRecording,
  };
}
