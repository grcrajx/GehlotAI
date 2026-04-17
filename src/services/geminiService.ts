import { GoogleGenAI } from "@google/genai";
import { ChatMessage, Subject } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are GehlotAI, a smart and friendly tutor for students. 
Your goal is to help students understand concepts, answer their questions, and assist with homework.
Always maintain a supportive, encouraging, and patient tone.
When explaining, break down complex topics into simple, step-by-step points.
Tailor your response based on the subject if specified.`;

export async function getChatResponse(
  message: string, 
  history: ChatMessage[], 
  subject: Subject,
  mode?: 'eli5' | 'summarize'
) {
  const model = "gemini-3-flash-preview";
  
  let prompt = message;
  if (mode === 'eli5') {
    prompt = `Explain exactly like I'm 5 years old: ${message}`;
  } else if (mode === 'summarize') {
    prompt = `Summarize the following text clearly for a student: ${message}`;
  }

  const chatHistory = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  const response = await ai.models.generateContent({
    model,
    contents: [
      ...chatHistory,
      { role: "user", parts: [{ text: prompt }] }
    ],
    config: {
      systemInstruction: `${SYSTEM_PROMPT}\n\nThe current subject is: ${subject}.`
    }
  });

  return response.text;
}
