import Chat from "./components/Chat";

export default function App() {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2 style={{ textAlign: "center" }}>🩺 AI Medical Voice Agent</h2>

      <p style={{ color: "red", textAlign: "center", fontSize: "14px" }}>
        ⚠️ This app does NOT provide medical diagnosis or treatment.
        Always consult a licensed medical professional.
      </p>

      <Chat />
    </div>
  );
}
