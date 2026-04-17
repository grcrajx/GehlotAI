import express, { Router } from "express";
import serverless from "serverless-http";
import { GoogleGenAI } from "@google/genai";

const app = express();
const router = Router();

app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const SYSTEM_PROMPT = `You are GehlotAI, a smart and friendly tutor for students. 
Your goal is to help students understand concepts, answer their questions, and assist with homework.
Always maintain a supportive, encouraging, and patient tone.
When explaining, break down complex topics into simple, step-by-step points.
Tailor your response based on the subject if specified.`;

router.post("/chat", async (req, res) => {
  const { message, history, subject, mode } = req.body;

  try {
    const model = "gemini-3-flash-preview";
    
    let prompt = message;
    if (mode === 'eli5') {
      prompt = `Explain exactly like I'm 5 years old: ${message}`;
    } else if (mode === 'summarize') {
      prompt = `Summarize the following text clearly for a student: ${message}`;
    }

    const chatHistory = history.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const result = await ai.models.generateContent({
      model,
      contents: [
        ...chatHistory,
        { role: "user", parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: `${SYSTEM_PROMPT}\n\nThe current subject is: ${subject}.`
      }
    });

    res.json({ text: result.text });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "Failed to get AI response" });
  }
});

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/.netlify/functions/api", router);

export const handler = serverless(app);
