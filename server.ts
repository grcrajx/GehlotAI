import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const { GoogleGenAI } = await import("@google/genai");
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  const SYSTEM_PROMPT = `You are GehlotAI, a smart and friendly tutor for students. 
Your goal is to help students understand concepts, answer their questions, and assist with homework.
Always maintain a supportive, encouraging, and patient tone.
When explaining, break down complex topics into simple, step-by-step points.
Tailor your response based on the subject if specified.`;

  app.post("/api/chat", async (req, res) => {
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
