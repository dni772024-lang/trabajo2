
import { GoogleGenAI } from "@google/genai";
import { Equipment, Loan } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const geminiService = {
  getInventoryInsights: async (equipment: Equipment[], loans: Loan[]) => {
    // Basic Text Tasks (e.g., summarization, proofreading, and simple Q&A): 'gemini-3-flash-preview'
    const model = 'gemini-3-flash-preview';
    const prompt = `
      Actúa como un experto en gestión de inventario de IT.
      Analiza los siguientes datos de equipos y préstamos:
      Equipos totales: ${equipment.length}
      Equipos disponibles: ${equipment.filter(e => e.status === 'Disponible').length}
      Préstamos activos: ${loans.filter(l => l.status === 'active').length}

      Genera un breve resumen (3 párrafos cortos) en español sobre el estado de la flota, 
      posibles riesgos de escasez y una recomendación estratégica.
    `;

    try {
      // Use ai.models.generateContent to query GenAI with both the model name and prompt.
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });
      // Access the text property directly
      const text = response.text || '';
      return text;
    } catch (error) {
      console.error("Gemini Error:", error);
      return "No se pudo generar el análisis inteligente en este momento.";
    }
  }
};

