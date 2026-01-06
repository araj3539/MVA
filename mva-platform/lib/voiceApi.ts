import { useAuth } from "@clerk/nextjs";

type AIResponse = {
  aiText: string;
  escalate?: boolean;
};

export async function sendTextToAI(text: string): Promise<AIResponse> {
  const { getToken } = useAuth();
  const token = await getToken();

  if (!token) {
    throw new Error("User not authenticated");
  }

  // Use the correct API URL (use env var in production)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const res = await fetch(
    `${apiUrl}/api/voice`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ text })
    }
  );

  if (!res.ok) {
    throw new Error("AI request failed");
  }

  return res.json();
}