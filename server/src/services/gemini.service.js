const genAI = require("../config/gemini");

exports.getGeminiResponse = async (userText) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
  });

  const prompt = `
You are a medical information assistant.

Rules:
- Do NOT diagnose diseases
- Do NOT prescribe medicines
- Provide only general health guidance
- Always advise consulting a licensed doctor if symptoms persist

User says: "${userText}"
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};
