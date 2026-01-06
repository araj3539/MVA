import { startSpeechRecognition } from "../utils/recorder";
import { sendTextToAI } from "../services/voiceApi";
import { speakText } from "../utils/speak";

export default function MicButton() {
  const handleClick = () => {
    startSpeechRecognition(async (userText) => {
      console.log("User:", userText);

      const res = await sendTextToAI(userText);
      speakText(res.aiText);
    });
  };

  return <button onClick={handleClick}>🎤 Speak</button>;
}
