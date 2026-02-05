
/**
 * STANDALONE PUBLIC API SERVER
 * Deploy this code to Render/Railway/Vercel to get a live endpoint URL.
 */
import express from 'express';
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const AUTH_KEY = "HONEYPOT_SECURE_EXTRACTION_2025"; // Your valid API key for authentication

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    classification: { type: Type.STRING },
    confidence_score: { type: Type.NUMBER },
    current_state: { type: Type.STRING },
    reply_text: { type: Type.STRING },
    extracted_intel: {
      type: Type.OBJECT,
      properties: {
        upi_ids: { type: Type.ARRAY, items: { type: Type.STRING } },
        bank_account_numbers: { type: Type.ARRAY, items: { type: Type.STRING } },
        phishing_urls: { type: Type.ARRAY, items: { type: Type.STRING } },
        phone_numbers: { type: Type.ARRAY, items: { type: Type.STRING } },
        scam_category: { type: Type.STRING },
      },
      required: ["upi_ids", "bank_account_numbers", "phishing_urls", "phone_numbers"]
    },
  },
  required: ["classification", "confidence_score", "current_state", "reply_text", "extracted_intel"],
};

app.post('/api/v1/engage', async (req, res) => {
  const apiKey = req.headers['x-api-key'];

  // 1. Authentication Check
  if (apiKey !== AUTH_KEY) {
    return res.status(401).json({ error: "Unauthorized: Invalid API Key" });
  }

  const { message, history = [] } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Missing 'message' in request body" });
  }

  try {
    const prompt = `
      Act as "Aarav Sharma", a 24y/o graphic designer from Bangalore.
      Goal: Trap scammers and extract payment info.
      
      History: ${JSON.stringify(history)}
      New Scammer Message: ${message}
      
      Return structured JSON data.
    `;

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const data = JSON.parse(result.text || "{}");
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Honey-Pot API Live at http://localhost:${PORT}/api/v1/engage`);
});
