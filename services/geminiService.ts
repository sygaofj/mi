import { GoogleGenAI } from "@google/genai";

const getClient = (): GoogleGenAI => {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateCamouflage = async (ciphertext: string, topic: string): Promise<string> => {
  try {
    const ai = getClient();
    const modelId = 'gemini-2.5-flash';
    
    const prompt = `
      Create a realistic, professional, or creative text based on the topic: "${topic}".
      
      At the very end of the text, append the following string exactly as it is, but label it as a "Reference ID", "Ticket Hash", "Debug Code", or "Signature" to make it look like a part of the system or document structure.
      
      The string to hide is:
      ${ciphertext}
      
      Do not modify the string. Just integrate it naturally as a metadata footer.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text || "Failed to generate camouflage text.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("AI service unavailable. Please check your API key.");
  }
};

export const analyzePasswordStrength = async (password: string): Promise<string> => {
    try {
        const ai = getClient();
        const modelId = 'gemini-2.5-flash';
        
        const prompt = `
          Analyze the strength of this password: "${password}".
          Provide a very brief, 1-sentence assessment of its entropy and safety. 
          Do not reveal the password in the response.
          If it is weak, suggest a general improvement (e.g., "Add symbols").
        `;
    
        const response = await ai.models.generateContent({
          model: modelId,
          contents: prompt,
        });
    
        return response.text || "Could not analyze password.";
      } catch (error) {
        return "AI analysis unavailable.";
      }
}