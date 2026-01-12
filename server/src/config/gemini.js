const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// 1. Auto-Load all keys starting with "GEMINI_API_KEY"
const apiKeys = Object.keys(process.env)
  .filter((key) => key.startsWith("GEMINI_API_KEY"))
  .sort() // Sorts them: KEY, KEY1, KEY2, KEY3...
  .map((key) => process.env[key])
  .filter((val) => val && val.length > 0); // Remove empty keys

if (apiKeys.length === 0) {
  throw new Error("❌ No GEMINI_API_KEYs found in .env file");
}

console.log(`✅ Loaded ${apiKeys.length} Gemini API Keys for rotation.`);

let currentKeyIndex = 0;

// 2. Export methods to manage keys dynamically
module.exports = {
  // Returns a client instance using the *current* active key
  getClient: () => {
    const currentKey = apiKeys[currentKeyIndex];
    return new GoogleGenerativeAI(currentKey);
  },

  // Moves the index to the next key (Circular/Round-Robin)
  rotateKey: () => {
    const prevIndex = currentKeyIndex;
    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    console.log(`🔄 Switching API Key: [${prevIndex}] ➔ [${currentKeyIndex}]`);
  },
};