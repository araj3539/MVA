const fs = require("fs");
const path = require("path");

exports.textToSpeech = async (text) => {
  const outputPath = path.join("responses", `${Date.now()}.txt`);

  fs.writeFileSync(outputPath, text);
  return outputPath;
};
