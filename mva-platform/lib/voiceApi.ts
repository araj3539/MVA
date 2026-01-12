// Type definition matching the Backend Response
export type AIResponse = {
  aiText: string;
  escalate?: boolean;        // If true, show Red Emergency Modal
  ignored?: boolean;         // If true, this was an echo; do not play audio
  recommendedDoctor?: any;   // If the assistant recommends a specific doctor
};

// Type definition for the Data we send to the Backend
export type VoicePayload = {
  text: string;
  isCallMode: boolean;       // true = Live Doctor Call, false = General Assistant
  doctorId?: string | null;  // The ID of the doctor we are talking to (if any)
};

/**
 * Sends user speech to the AI backend.
 * * @param payload - Object containing text and context (mode/doctorId)
 * @param token - The Clerk JWT token for authentication
 */
export async function sendTextToAI(
  payload: VoicePayload, 
  token: string
): Promise<AIResponse> {
  
  if (!token) {
    console.error("❌ sendTextToAI: No authentication token provided.");
    throw new Error("User not authenticated");
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  try {
    const res = await fetch(`${apiUrl}/api/voice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Pass the Clerk Token. Backend middleware 'requireAuth' verifies this.
        Authorization: `Bearer ${token}`, 
      },
      body: JSON.stringify({
        text: payload.text,
        isCallMode: payload.isCallMode,
        doctorId: payload.doctorId || null,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server Error: ${res.status}`);
    }

    const data: AIResponse = await res.json();
    return data;

  } catch (error) {
    console.error("🔥 AI Request Failed:", error);
    // Return a safe fallback so the app doesn't crash
    throw error;
  }
}