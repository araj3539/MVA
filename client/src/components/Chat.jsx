import { useState } from "react";
import MessageBubble from "./MessageBubble";
import MicButton from "./MicButton";
import DoctorCTA from "./DoctorCTA";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [showDoctorCTA, setShowDoctorCTA] = useState(false);

  const addMessage = (text, sender) => {
    setMessages((prev) => [...prev, { text, sender }]);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "80vh",
        maxWidth: "600px",
        margin: "auto"
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "10px",
          border: "1px solid #ddd",
          borderRadius: "6px"
        }}
      >
        {messages.map((m, i) => (
          <MessageBubble key={i} text={m.text} sender={m.sender} />
        ))}
      </div>

      {showDoctorCTA && <DoctorCTA />}

      <div style={{ marginTop: "10px", textAlign: "center" }}>
        <MicButton
          addMessage={addMessage}
          setShowDoctorCTA={setShowDoctorCTA}
        />
      </div>
    </div>
  );
}
