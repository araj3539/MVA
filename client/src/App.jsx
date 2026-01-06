import MicButton from "./components/MicButton";
import Disclaimer from "./components/Disclaimer";

export default function App() {
  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h2>🩺 AI Medical Voice Agent</h2>
      <p>Speak your symptoms and receive general medical guidance.</p>

      <MicButton />

      <Disclaimer />
    </div>
  );
}
