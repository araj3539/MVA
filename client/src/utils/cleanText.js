export const cleanAIText = (text) => {
  if (!text) return "";

  return text
    // Remove markdown bold/italic
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/__/g, "")
    .replace(/_/g, "")

    // Remove bullet points
    .replace(/•/g, "")
    .replace(/- /g, "")
    
    // Remove numbered lists like "1."
    .replace(/\d+\./g, "")

    // Remove extra new lines
    .replace(/\n+/g, " ")

    // Trim spaces
    .trim();
};
