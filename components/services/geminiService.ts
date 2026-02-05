import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';
import { AgentResponse, ChatMessage, Sender } from '../types';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    classification: {
      type: Type.STRING,
      enum: ["SCAM", "LEGIT", "UNCERTAIN"],
      description: "Classify the user's intent.",
    },
    confidence_score: {
      type: Type.NUMBER,
      description: "Confidence score between 0 and 1.",
    },
    current_state: {
      type: Type.STRING,
      enum: ["DETECTION", "ENGAGEMENT", "EXTRACTION"],
      description: "The current state of the honey-pot operation.",
    },
    reply_text: {
      type: Type.STRING,
      description: "The persona's reply to the user.",
    },
    explanation: {
      type: Type.STRING,
      description: "Brief internal reasoning for the classification and state.",
    },
    extracted_intel: {
      type: Type.OBJECT,
      properties: {
        upi_ids: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Extracted UPI IDs (e.g., example@okicici).",
        },
        bank_account_numbers: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Extracted bank account numbers or IFSC codes.",
        },
        phishing_urls: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Extracted suspicious URLs.",
        },
        phone_numbers: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Extracted phone numbers.",
        },
        scam_category: {
          type: Type.STRING,
          description: "Type of scam (e.g., Job, Crypto, Lottery, Sextortion).",
        },
      },
      required: ["upi_ids", "bank_account_numbers", "phishing_urls", "phone_numbers"],
    },
  },
  required: ["classification", "confidence_score", "current_state", "reply_text", "extracted_intel"],
};

export const processMessage = async (
  history: ChatMessage[],
  newMessage: string
): Promise<AgentResponse> => {
  
  // Format history for the model
  const historyText = history.map(m => 
    `${m.sender === Sender.User ? 'Scammer' : 'Aarav'}: ${m.text}`
  ).join('\n');

  const prompt = `
    ${SYSTEM_INSTRUCTION}

    ---
    **Conversation History:**
    ${historyText}
    
    **New Message from Scammer:**
    ${newMessage}
    
    ---
    Generate the JSON response following the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7, // Slight creativity for the persona
      },
    });

    const jsonText = response.text || "{}";
    const data = JSON.parse(jsonText) as AgentResponse;
    return data;
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback response in case of error
    return {
      classification: 'UNCERTAIN',
      confidence_score: 0,
      current_state: 'DETECTION' as any,
      reply_text: "Sorry, I didn't quite catch that. Could you repeat?",
      explanation: "API Error occurred.",
      extracted_intel: {
        upi_ids: [],
        bank_account_numbers: [],
        phishing_urls: [],
        phone_numbers: [],
        scam_category: "Unknown",
      }
    };
  }
};

// --- MOCK SCAMMER API SIMULATION ---
// This acts as the "Mock Scammer API" required by the hackathon.
// It generates context-aware scam messages to test the Honey-Pot.

export const generateScamMessage = async (
  scenario: string, 
  history: ChatMessage[]
): Promise<string> => {
  
  const historyText = history.map(m => 
    `${m.sender === Sender.User ? 'You (Scammer)' : 'Target (Aarav)'}: ${m.text}`
  ).join('\n');

  const prompt = `
    You are a professional cybercriminal. 
    Your goal is to trick the target into a ${scenario} scam.
    
    Current Stage of Scam:
    - If this is the first message, start the hook.
    - If the target is responding, push them to send money (UPI/Bank) or click a link.
    - Create fake UPI IDs (e.g., boss@scambank) or Links (e.g., www.phish-login.com) when necessary to test the target's extraction logic.

    Conversation History:
    ${historyText}

    Task: Generate the next short message sent by the scammer. 
    Output only the message text. Do not include quotes.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.9, // High creativity for diverse scam tactics
      },
    });
    return response.text || "Hello, I have an offer for you.";
  } catch (error) {
    return "Click this link: www.fallback-scam.com";
  }
};
