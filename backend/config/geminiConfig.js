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
        console.log("Starting Gemini API call...");

        // Add timeout wrapper
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Gemini API timeout')), 18000); // 18 seconds
        });

        const apiCall = ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            timeout: 15000 // 15 second timeout on the API call itself
        });

        const response = await Promise.race([apiCall, timeoutPromise]);

        console.log("Gemini API call completed successfully");
        return response.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("Error generating content:", error.message);

        if (error.message === 'Gemini API timeout') {
            throw new Error('AI service is currently slow. Please try again with fewer questions.');
        }

        throw error;
    }
}

module.exports = { chat };