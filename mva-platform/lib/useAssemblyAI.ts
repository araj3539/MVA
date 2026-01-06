export function useAssemblyAI(
  onFinalTranscript: (text: string) => void,
  onPartial?: (text: string) => void
) {
  let socket: WebSocket;
  let audioContext: AudioContext;
  let processor: ScriptProcessorNode;

  const start = async () => {
    const tokenRes = await fetch("/api/assembly/token");
    const { token } = await tokenRes.json();

    socket = new WebSocket(
      `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${token}`
    );

    socket.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.text) {
        data.is_final
          ? onFinalTranscript(data.text)
          : onPartial?.(data.text);
      }
    };

    audioContext = new AudioContext({ sampleRate: 16000 });
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = audioContext.createMediaStreamSource(stream);

    processor = audioContext.createScriptProcessor(4096, 1, 1);
    source.connect(processor);
    processor.connect(audioContext.destination);

    processor.onaudioprocess = (e) => {
      const input = e.inputBuffer.getChannelData(0);
      const pcm16 = convertFloat32ToInt16(input);
      socket.send(pcm16);
    };
  };

  const stop = () => {
    processor?.disconnect();
    socket?.close();
    audioContext?.close();
  };

  return { start, stop };
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
