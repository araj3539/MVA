export const sendTextToAI = async (text) => {
  const res = await fetch("http://localhost:5000/api/voice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });

  return res.json();
};
