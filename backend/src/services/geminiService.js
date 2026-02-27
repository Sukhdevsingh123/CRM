import axios from "axios";

class GeminiService {
  constructor() {
    this.apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
  }

  async generateFollowUp(leadDetails, recentActivities) {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API key not configured");
      }
      const activitiesContext = recentActivities.map(activity => {
        const date = new Date(activity.createdAt).toLocaleDateString();
        return `${date}: ${activity.type} - ${activity.description}`;
      }).join('\n');

      const prompt = `You are a professional wellness coach assistant. Generate follow-up content for a lead based on their details and recent interactions.

Lead Details:
- Name: ${leadDetails.name}
- Phone: ${leadDetails.phone}
- Source: ${leadDetails.source}
- Current Status: ${leadDetails.status}
- Tags: ${leadDetails.tags || 'None'}
- Next Follow-up: ${leadDetails.nextFollowUpAt ? new Date(leadDetails.nextFollowUpAt).toLocaleDateString() : 'Not scheduled'}

Recent Activities:
${activitiesContext || 'No recent activities'}

Return ONLY valid JSON with fields:
{
  "whatsappMessage": "string",
  "callScript": "string",
  "objectionHandling": "string"
}`;

      const response = await axios.post(
        `${this.apiUrl}?key=${apiKey.trim()}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      const generatedText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        throw new Error("No response from Gemini API");
      }

      const cleanText = generatedText.replace(/```(json)?\n?|\n?```/g, '').trim();
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(cleanText);
      } catch (err) {
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } else {
          throw new SyntaxError("Failed to parse JSON");
        }
      }

      return {
        success: true,
        data: {
          whatsappMessage: parsedResponse.whatsappMessage || "",
          callScript: parsedResponse.callScript || "",
          objectionHandling: parsedResponse.objectionHandling || "",
        }
      };

    } catch (error) {
      console.error("Gemini API error:", error.response?.data || error.message);

      if (error.response?.status === 429) {
        throw new Error("AI service temporarily unavailable. Please try again later.");
      }

      if (error.response?.status === 403 || error.response?.status === 400) {
        throw new Error("AI service authentication failed. Please check API configuration.");
      }

      if (error instanceof SyntaxError) {
        throw new Error("AI service returned invalid response format.");
      }

      throw new Error(`Failed to generate follow-up content: ${error.message}`);
    }
  }
}

export default new GeminiService();

