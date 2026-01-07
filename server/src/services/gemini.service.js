const genAI = require("../config/gemini");

exports.getGeminiResponse = async (userText, history, doctorList) => {
  // Use 'gemini-1.5-flash' for high rate limits
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
You are an advanced Medical AI Assistant for the MVA Platform.

### CONTEXT:
${history || "No previous context."}

### AVAILABLE DOCTORS:
${doctorList || "No doctors available."}

### USER INPUT:
"${userText}"

### INSTRUCTIONS:
1. **Analyze Symptoms:** Provide brief, empathetic guidance.
2. **Recommend Doctors:** If a specific doctor from the list matches the symptoms, you MUST recommend them.
3. **CRITICAL FORMAT:** If you recommend a doctor, you must append their exact ID at the end of the response in this format: [REC:DOCTOR_ID].
   - Example response: "Based on your heart pain, Dr. Sarah Smith is a great choice. [REC:user_doc_cardio_01]"
4. **No Hallucinations:** Only recommend doctors listed above.
5. **format:** Reply only with the medical advice or doctor recommendation. No additional text.
6. **response length:** Keep it under 100 words.

Response:
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};