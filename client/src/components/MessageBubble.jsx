export default function MessageBubble({ text, sender }) {
  return (
    <div
      style={{
        alignSelf: sender === "user" ? "flex-end" : "flex-start",
        background: sender === "user" ? "#DCF8C6" : "#F1F1F1",
        padding: "10px 14px",
        borderRadius: "12px",
        margin: "6px",
        maxWidth: "70%"
      }}
    >
      {text}
    </div>
  );
}
