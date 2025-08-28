const { GoogleGenAI } = require("@google/genai");

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined");
}
const ai = new GoogleGenAI({
    apiKey: apiKey,
})

const chat = async (prompt) => {
    try {

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-lite",
            contents: prompt,
        });
        console.log("AI Responsessss:", response.candidates[0].content.parts[0].text);
        return response.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("Error generating content:", error);
        throw error;
    }
}

module.exports = { chat };