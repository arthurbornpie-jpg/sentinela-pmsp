
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Subject, Message, Question, NewsItem } from "../types";

export interface NewsBriefing {
  content: string;
  sources: { title: string, url: string }[];
}

export class GeminiService {
  private getModel(type: 'flash' | 'pro' = 'flash') {
    // Seguindo as diretrizes de modelos mais recentes
    return type === 'pro' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  }

  async generateQuestion(subject: Subject): Promise<Question> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Gere uma questão de múltipla escolha para o concurso da Polícia Militar de São Paulo (PMSP) sobre o tema: ${subject}. 
    A questão deve ser rigorosamente no nível da banca VUNESP. 
    Retorne no formato JSON com: text, options (array de 4 strings), correctAnswer (índice 0-3) e explanation.`;

    const response = await ai.models.generateContent({
      model: this.getModel('flash'),
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            options: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            correctAnswer: { type: Type.INTEGER },
            explanation: { type: Type.STRING }
          },
          required: ["text", "options", "correctAnswer", "explanation"]
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    return { ...data, id: Math.random().toString(36).substr(2, 9), subject };
  }

  async generateMockExamBatch(subject: Subject, count: number): Promise<Question[]> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Gere exatamente ${count} questões de múltipla escolha para o concurso PMSP sobre o tema ${subject}.
    ESTILO: Banca VUNESP (Soldado 2ª Classe).
    FORMATO: Retorne um ARRAY de objetos JSON. Cada objeto DEVE ter: text, options (exatamente 4), correctAnswer (0-3), explanation.`;

    const response = await ai.models.generateContent({
      model: this.getModel('flash'),
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              options: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctAnswer: { type: Type.INTEGER },
              explanation: { type: Type.STRING }
            },
            required: ["text", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });

    const questionsData = JSON.parse(response.text || '[]');
    return questionsData.map((q: any) => ({
      ...q,
      id: Math.random().toString(36).substr(2, 9),
      subject
    }));
  }

  async askTutor(history: Message[], question: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const systemInstruction = `Você é o Sargento Tutor, instrutor-chefe do projeto SENTINELA PMSP.
    MISSÃO: Treinar recrutas para o concurso de Soldado da PM de São Paulo.
    PERSONALIDADE: Disciplinado, direto, patriota e motivador. Use gírias militares (Brio, Padrão, QAP, Zero Um).
    CONHECIMENTO: Especialista no edital da VUNESP. 
    REGRAS: Se o recruta fugir do tema, dê um "corretivo" verbal leve e traga-o de volta ao estudo.`;

    const response = await ai.models.generateContent({
      model: this.getModel('pro'),
      contents: [...history.map(m => m.content), question].join("\n"),
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || "Sem resposta do comando.";
  }

  // Corrigindo erro: Implementado explainQuestionResult para análise individual pós-simulado
  async explainQuestionResult(question: Question, selectedIdx: number): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Analise a questão e a resposta do recruta para o concurso PMSP.
    Questão: ${question.text}
    Opções: ${question.options.join(' | ')}
    Gabarito: ${question.options[question.correctAnswer]}
    Escolha do Recruta: ${selectedIdx === -1 ? 'Não respondeu' : question.options[selectedIdx]}
    
    Dê uma explicação curta, direta e motivadora no tom de um Sargento Tutor instrutor da PM.`;

    const response = await ai.models.generateContent({
      model: this.getModel('flash'),
      contents: prompt,
      config: {
        systemInstruction: "Você é o Sargento Tutor, especialista em VUNESP. Use gírias militares como 'Brio' e 'QAP'.",
      }
    });

    return response.text || "Sem análise disponível no momento, recruta.";
  }

  // Corrigindo erro: Implementado getTacticalHint para apoio durante o simulado
  async getTacticalHint(question: Question): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Dê uma dica tática para esta questão de ${question.subject} sem revelar a resposta.
    Questão: ${question.text}`;

    const response = await ai.models.generateContent({
      model: this.getModel('flash'),
      contents: prompt,
      config: {
        systemInstruction: "Você é o Sargento Tutor. Dê dicas curtas e táticas sem dar a resposta final. Estilo militar.",
      }
    });

    return response.text || "Pense rápido e siga o regulamento!";
  }

  async vocalizeText(text: string): Promise<string | undefined> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Diga de forma firme: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Puck' },
            },
          },
        },
      });
      return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (e) {
      return undefined;
    }
  }

  async fetchPMSPNews(): Promise<NewsBriefing> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Quais as notícias reais de 2024 e 2025 sobre editais e provas da PMSP? Gere um relatório tático.",
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return {
      content: response.text || "Sem atualizações críticas.",
      sources: sources.filter((c: any) => c.web).map((c: any) => ({ title: c.web.title, url: c.web.uri }))
    };
  }
}

export const geminiService = new GeminiService();
