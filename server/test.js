const { chatWithGemini } = require("./gemini");

(async () => {
  const reply = await chatWithGemini("how to cure acne!");
  console.log("Gemini says:", reply);
})();
