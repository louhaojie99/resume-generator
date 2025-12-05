import { GoogleGenAI } from "@google/genai";
import { ResumeData } from "../types";

// Note: In a real production app, you should proxy these calls through a backend
// to protect the API Key. For this demo, we use the env variable directly.
// Safely access process.env to avoid crashes in browser environments without polyfills
const getApiKey = () => {
  try {
    return process.env.API_KEY || '';
  } catch (e) {
    return '';
  }
};

const API_KEY = getApiKey();

const ai = new GoogleGenAI({ apiKey: API_KEY });

const MODEL_FAST = 'gemini-2.5-flash';

export const GeminiService = {
  /**
   * Optimizes a professional summary based on the user's experience and skills.
   */
  async optimizeSummary(currentSummary: string, jobTitle: string, skills: string[]): Promise<string> {
    if (!API_KEY) return "API Key missing. Please configure your environment.";

    try {
      const prompt = `
        你是一位精通前端技术招聘的资深面试官。
        请重写以下个人总结，使其更具影响力、简洁（不超过4句话），并针对${jobTitle}职位包含高价值关键词。
        
        重要：必须使用中文输出。
        
        当前总结: "${currentSummary}"
        核心技能: ${skills.join(', ')}
        
        仅返回重写后的总结文本，不要包含引号或其他说明。
      `;

      const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: prompt,
      });

      return response.text?.trim() || currentSummary;
    } catch (error) {
      console.error("Gemini optimization error:", error);
      return currentSummary;
    }
  },

  /**
   * Improves a single bullet point for experience or projects.
   */
  async improveBulletPoint(bullet: string): Promise<string> {
    if (!API_KEY) return bullet;

    try {
      const prompt = `
        作为前端技术专家，请优化以下简历工作经历的描述。
        要求：使用强有力的动词，尽可能量化成果（如提升了xx%性能），体现专业性。
        
        重要：必须使用中文输出。
        
        原始描述: "${bullet}"
        
        仅返回优化后的描述文本，不要包含引号。
      `;

      const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: prompt,
      });

      return response.text?.trim() || bullet;
    } catch (error) {
      console.error("Gemini bullet improvement error:", error);
      return bullet;
    }
  }
};