const EMERGENCY_KEYWORDS = [
  "chest pain",
  "difficulty breathing",
  "severe bleeding",
  "unconscious",
  "heart attack"
];

exports.checkEmergency = (text) => {
  return EMERGENCY_KEYWORDS.some(word =>
    text.toLowerCase().includes(word)
  );
};
