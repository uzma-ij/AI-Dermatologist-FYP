const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

console.log("Using key:", process.env.GEMINI_API_KEY);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Guardrail for skin-related queries
function isSkinRelated(query) {
  const keywords = [
    "skin", "acne", "pimples", "eczema", "psoriasis", "itching",
    "rashes", "allergy", "dermatitis", "infection", "moles",
    "dry skin", "oily skin", "redness", "burn", "scar", "consultation",
    "cream", "face", "body", "hands", "feet", "spots", "treatment",
    "disease", "dermatologist"
  ];

  return keywords.some(word => query.toLowerCase().includes(word));
}

// Main chat function
async function chatWithGemini(message, diseaseName = null, confidence = null) {
  try {
    if (!isSkinRelated(message) && !diseaseName) {
      return "Hi, I'm here only to assist with skin disease and skincare-related questions. Please ask something related to that.";
    }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let prompt = `
You are an AI dermatologist assistant.
Only answer questions about skin diseases, treatments, home remedies, symptoms, and skincare advice.
If the user asks unrelated things, politely refuse.

STYLE REQUIREMENTS:
- Respond in at most 6 short bullet points.
- Use SIMPLE hyphen bullets only ("- "), no numbering.
- Keep each bullet under 120 characters.
- Use clear, actionable steps only; no long paragraphs.
- Prefer medication names, dosages (when safe), and when to see a doctor.
- If unsure, say so and advise professional consultation.

If a detected disease is provided, focus your answers around that disease.

Example refusal: "I'm here only to assist with skin disease and skincare-related questions."
`;

    if (diseaseName) {
      prompt += `\nThe detected skin disease from the uploaded image is "${diseaseName}" with ${(confidence * 100).toFixed(2)}% confidence.\n`;
    }

    prompt += `\nUser message: ${message}\n\nReturn ONLY hyphen bullets, one per line. No intro, no conclusion, no numbering.`;

    // ✅ Correct method for @google/generative-ai
    const result = await model.generateContent(prompt);

    return result.response.text();
  } catch (error) {
    console.error("Gemini API error:", error);
    return "Error connecting to AI service.";
  }
}

module.exports = { chatWithGemini };
