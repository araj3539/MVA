const genAI = require("../config/gemini");

exports.getGeminiResponse = async (userText) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
You are a medical information assistant.
You must NOT diagnose or prescribe medicine.
Give general health information only.
Always advise consulting a licensed doctor.

User: ${userText}
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};
