export default function DoctorCTA() {
  return (
    <div
      style={{
        marginTop: "15px",
        padding: "15px",
        border: "1px solid #ff4d4f",
        borderRadius: "8px",
        background: "#fff1f0"
      }}
    >
      <p style={{ marginBottom: "10px" }}>
        👨‍⚕️ Your symptoms may require professional medical attention.
      </p>

      <button
        onClick={() => window.open("https://www.practo.com", "_blank")}
        style={{
          padding: "10px 16px",
          background: "#ff4d4f",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        Book Doctor Appointment
      </button>
    </div>
  );
}
