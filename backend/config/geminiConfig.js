const { GoogleGenAI } = require("@google/genai");

// Override with GEMINI_MODEL=... in .env if Google retires this one again.
const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

const chat = async (prompt) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not defined");
        }
        
        const ai = new GoogleGenAI({
            apiKey: apiKey,
        })

        const response = await ai.models.generateContent({
            model: MODEL,
            contents: prompt,
        });
        // console.log("AI Responsessss:", response.candidates[0].content.parts[0].text);
        const text =
            response?.candidates?.[0]?.content?.parts
                ?.map((part) => part.text || "")
                .join("") ||
            response?.text ||
            "";
        if (!text) {
            throw new Error("Empty response from AI model");
        }
        return text;
    } catch (error) {
        console.error("Error generating content:", error);
        throw error;
    }
}

module.exports = { chat };