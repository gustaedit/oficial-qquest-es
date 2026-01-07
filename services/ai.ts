
import { GoogleGenAI, Type } from "@google/genai";
import { Question, Difficulty } from "../types";

/**
 * SERVIÇO DE INTELIGÊNCIA FORENSE
 * Gera questões e processa documentos usando Gemini 3.
 */
export const aiService = {
  // Use 'gemini-3-pro-preview' for complex reasoning tasks like generating exam questions
  generateQuestion: async (board: string, discipline: string, difficulty: Difficulty, institution: string): Promise<Question> => {
    // ALWAYS initialize GoogleGenAI with a named parameter for the API key from process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `Gere uma questão INÉDITA de concurso de POLÍCIA CIVIL.
    Banca: ${board} | Disciplina: ${discipline} | Nível: ${difficulty} | Órgão: ${institution}.
    Use terminologia jurídica e policial técnica. Responda apenas em JSON.`;

    // ALWAYS use ai.models.generateContent to query GenAI with both the model name and prompt/contents
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  text: { type: Type.STRING }
                }
              }
            },
            correctOptionId: { type: Type.STRING },
            comment: { type: Type.STRING }
          }
        }
      }
    });

    // Access the generated text using the .text property (not a method)
    const data = JSON.parse(response.text || "{}");
    return {
      ...data,
      id: `ai-${Date.now()}`,
      isAI: true,
      board, discipline, difficulty, institution,
      year: new Date().getFullYear().toString(),
      position: 'Agente de Inteligência',
      topic: 'Tópico Avançado',
      contestClass: 'Especializada',
      createdAt: Date.now()
    };
  },

  // Use 'gemini-3-pro-preview' for complex multimodal tasks like extracting structured data from PDF
  processPDF: async (base64: string, board: string, institution: string, year: string): Promise<Question[]> => {
    // ALWAYS initialize GoogleGenAI with a named parameter for the API key from process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Extraia as questões deste PDF de prova da ${institution}. Converta para JSON estruturado como um array de objetos de questão.`;

    // ALWAYS use ai.models.generateContent for multimodal inputs like PDF + Text
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          { inlineData: { mimeType: "application/pdf", data: base64 } },
          { text: prompt }
        ]
      },
      config: { 
        responseMimeType: "application/json",
        // Using responseSchema to ensure the AI returns a valid array of questions
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    text: { type: Type.STRING }
                  }
                }
              },
              correctOptionId: { type: Type.STRING },
              comment: { type: Type.STRING },
              discipline: { type: Type.STRING },
              topic: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              position: { type: Type.STRING },
              contestClass: { type: Type.STRING }
            }
          }
        }
      }
    });

    // Access the generated text using the .text property (not a method)
    const raw = JSON.parse(response.text || "[]");
    return raw.map((q: any) => ({
      ...q,
      id: Math.random().toString(36).substr(2, 9),
      board, institution, year,
      createdAt: Date.now()
    }));
  }
};
