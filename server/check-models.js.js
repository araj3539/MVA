// check-models.js
require('dotenv').config(); // Loads your .env file
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ Error: GEMINI_API_KEY is missing from .env");
  process.exit(1);
}

async function getModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error("❌ API Error:", data.error.message);
      return;
    }

    console.log("\n✅ AVAILABLE MODELS:");
    console.log("-----------------------------------");
    data.models.forEach(model => {
      // Filter only for 'generateContent' models (the ones you can use)
      if (model.supportedGenerationMethods.includes("generateContent")) {
        console.log(`Model ID:   ${model.name.replace("models/", "")}`);
        console.log(`Limit:      ${model.inputTokenLimit} tokens`);
        console.log("-----------------------------------");
      }
    });

  } catch (error) {
    console.error("❌ Network Error:", error);
  }
}

getModels();