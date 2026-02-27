
import axios from "axios";

class GeminiService {
  constructor() {
    this.apiUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
  }

  async generateFollowUp(leadDetails, recentActivities = []) {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API key not configured");
      }

      const activitiesContext = recentActivities
        .slice(0, 3)
        .map((activity) => {
          const date = new Date(activity.createdAt).toLocaleDateString();
          return `${date}: ${activity.type}`;
        })
        .join("\n");

      const prompt = `
You are a CRM AI assistant for a wellness coach.

Generate structured follow-up content.

LEAD:
Name: ${leadDetails.name}
Source: ${leadDetails.source}
Status: ${leadDetails.status}
Tags: ${leadDetails.tags || "None"}

RECENT ACTIVITY:
${activitiesContext || "No recent activity"}

STRICT RULES:
- WhatsApp message must be under 150 characters.
- Call script must contain EXACTLY 3 short bullet points.
- Each bullet must be under 12 words.
- Objection handling must be EXACTLY 2 lines:
  Line 1 starts with: Question:
  Line 2 starts with: Answer:
- If status is NOT "INTERESTED", objectionHandling must be empty string.
- No markdown.
- No numbering.
- No extra explanation.
- Return ONLY valid JSON.

OUTPUT FORMAT:
{
  "whatsappMessage": "string",
  "callScript": ["point 1", "point 2", "point 3"],
  "objectionHandling": "string"
}
`;

      const response = await axios.post(
        `${this.apiUrl}?key=${apiKey.trim()}`,
        {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.5,
            topP: 0.9,
            response_mime_type: "application/json",
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const generatedText =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        throw new Error("No response from Gemini API");
      }

      const cleanText = generatedText
        .replace(/```json\n?|\n?```/g, "")
        .trim();

      let parsed;

      try {
        parsed = JSON.parse(cleanText);
      } catch {
        const match = cleanText.match(/\{[\s\S]*\}/);
        if (!match) {
          throw new SyntaxError("Invalid JSON returned by AI");
        }
        parsed = JSON.parse(match[0]);
      }

      // 🔥 Production-safe formatting cleanup
      const whatsapp =
        (parsed.whatsappMessage || "").slice(0, 150).trim();

      const callScript = Array.isArray(parsed.callScript)
        ? parsed.callScript.slice(0, 3).map((p) => p.trim())
        : [];

      let objection = "";
      if (leadDetails.status === "INTERESTED") {
        objection = (parsed.objectionHandling || "")
          .replace(/\*\*/g, "")
          .replace(/\r/g, "")
          .trim();
        const lines = objection.split("\n").filter(Boolean);
        if (lines.length > 2) {
          objection = lines.slice(0, 2).join("\n");
        }
      }

      return {
        success: true,
        data: {
          whatsappMessage: whatsapp,
          callScript,
          objectionHandling: objection,
        },
      };
    } catch (error) {
      console.error(
        "Gemini API error:",
        error.response?.data || error.message
      );

      if (error.response?.status === 429) {
        throw new Error(
          "AI service temporarily unavailable. Please try again later."
        );
      }

      if (
        error.response?.status === 403 ||
        error.response?.status === 400
      ) {
        throw new Error(
          "AI authentication failed. Check API configuration."
        );
      }

      if (error instanceof SyntaxError) {
        throw new Error("AI returned invalid JSON format.");
      }

      throw new Error(
        "Failed to generate follow-up content."
      );
    }
  }
}

export default new GeminiService();