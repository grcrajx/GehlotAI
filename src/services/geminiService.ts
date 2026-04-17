import { ChatMessage, Subject } from "../types";

export async function getChatResponse(
  message: string, 
  history: ChatMessage[], 
  subject: Subject,
  mode?: 'eli5' | 'summarize'
) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      history,
      subject,
      mode,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to get AI response");
  }

  const data = await response.json();
  return data.text;
}
