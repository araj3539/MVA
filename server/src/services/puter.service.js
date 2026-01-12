const { init } = require("@heyputer/puter.js/src/init.cjs");

let puterClient;

/**
 * Lazy-init Puter client
 */
function getPuterClient() {
  if (!puterClient) {
    if (!process.env.PUTER_AUTH_TOKEN) {
      throw new Error("PUTER_AUTH_TOKEN not set in environment");
    }

    puterClient = init(process.env.PUTER_AUTH_TOKEN);
    console.log("🟣 Puter client initialized");
  }
  return puterClient;
}

/**
 * Generate response using Puter (slow, large context)
 */
exports.generateWithPuter = async (prompt, systemInstruction) => {
  try {
    const puter = getPuterClient();

    const response = await puter.ai.chat([
      { role: "system", content: systemInstruction },
      { role: "user", content: prompt },
    ]);

    // Puter returns plain text or structured output
    if (typeof response === "string") return response;
    if (response?.text) return response.text;
    if (response?.message?.content) return response.message.content;

    return String(response);
  } catch (err) {
    console.error("🔥 Puter Error:", err.message);
    throw err;
  }
};
