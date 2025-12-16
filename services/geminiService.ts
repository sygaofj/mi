import { GoogleGenAI } from "@google/genai";

const getClient = (): GoogleGenAI => {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateCamouflage = async (ciphertext: string, topic: string): Promise<string> => {
  try {
    const ai = getClient();
    const modelId = 'gemini-2.5-flash';
    
    const prompt = `
      请根据主题：“${topic}”，用中文创作一段逼真的、专业的或富有创意的文本。
      
      在文本的最后，完全保留并附加以下字符串，但将其标记为“参考 ID”、“Ticket Hash”、“调试代码”或“签名”，使其看起来像是系统或文档结构的一部分。
      
      需要隐藏的字符串是：
      ${ciphertext}
      
      请勿修改该字符串。只需将其自然地整合为元数据页脚即可。
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text || "生成伪装文本失败。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("AI 服务不可用。请检查您的 API 密钥。");
  }
};

export const analyzePasswordStrength = async (password: string): Promise<string> => {
    try {
        const ai = getClient();
        const modelId = 'gemini-2.5-flash';
        
        const prompt = `
          分析此密码的强度：“${password}”。
          用中文提供一句非常简短的评估，关于其熵值和安全性。
          不要在回复中透露密码。
          如果密码较弱，请给出一个通用的改进建议（例如，“添加符号”）。
        `;
    
        const response = await ai.models.generateContent({
          model: modelId,
          contents: prompt,
        });
    
        return response.text || "无法分析密码。";
      } catch (error) {
        return "AI 分析不可用。";
      }
}