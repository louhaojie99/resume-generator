import { GoogleGenAI, Type } from "@google/genai";
import { ResumeData, ATSResult } from "../types";

// Note: In a real production app, you should proxy these calls through a backend
// to protect the API Key. For this demo, we use the env variable directly.
const API_KEY = process.env.API_KEY || '';

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
  },

  /**
   * Performs a mock ATS scan on the resume.
   */
  async checkATS(resume: ResumeData): Promise<ATSResult> {
    if (!API_KEY) {
      return {
        score: 0,
        missingKeywords: ["API Key Missing"],
        suggestions: ["请配置 Gemini API Key 以使用此功能。"]
      };
    }

    try {
      // Flatten skills for context
      const allSkills = resume.skills.flatMap(s => s.skills).join(", ");
      const expText = resume.experience.map(e => `${e.position} at ${e.company}: ${e.highlights.join(". ")}`).join("\n");
      
      const prompt = `
        请像一个严格的ATS（招聘管理系统）系统一样分析这份前端工程师简历。
        
        简历内容:
        技能: ${allSkills}
        工作经历: ${expText}
        个人总结: ${resume.personalInfo.summary}
        
        请提供 JSON 格式的分析结果：
        1. score (0-100 的整数评分)
        2. missingKeywords (数组，列出缺失的关键前端技术栈或软技能关键词，中英文均可)
        3. suggestions (数组，针对简历的具体优化建议，使用中文)
      `;

      const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER },
              missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      });

      if (response.text) {
        return JSON.parse(response.text) as ATSResult;
      }
      throw new Error("No response text");

    } catch (error) {
      console.error("Gemini ATS check error:", error);
      return {
        score: 0,
        missingKeywords: [],
        suggestions: ["分析出错，请稍后重试。"]
      };
    }
  }
};