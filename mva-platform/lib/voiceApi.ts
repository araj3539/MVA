// REMOVED: import { useAuth } from "@clerk/nextjs"; 

type AIResponse = {
  aiText: string;
  escalate?: boolean;
};

// FIX: Accept 'token' as an argument
export async function sendTextToAI(text: string, token: string): Promise<AIResponse> {
  if (!token) {
    throw new Error("User not authenticated");
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const res = await fetch(
    `${apiUrl}/api/voice`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}` // Use the passed token
      },
      body: JSON.stringify({ text })
    }
  );

  if (!res.ok) {
    throw new Error("AI request failed");
  }

  return res.json();
}