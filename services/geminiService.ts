import { GoogleGenAI, Type } from '@google/genai';
import type { Word } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini features will be mocked.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

// --- MOCK IMPLEMENTATIONS ---
const mockDictionaryWord: Word = {
    word: "Query",
    pronunciation: "/ˈkwɪəri/",
    definition: "A question, especially one addressed to an official or organization.",
    example: "The journalist posed a sharp query to the politician.",
    synonyms: ["question", "inquiry", "interrogation"],
    difficulty: 'easy',
};

const mockReverseSearchResult = ["Vocabulary", "Lexicon", "Glossary"];


// --- API Service ---

export const findWordFromDefinition = async (definition: string): Promise<string[]> => {
    if (!ai) return Promise.resolve(mockReverseSearchResult);
    try {
        const prompt = `Based on the following definition or concept, suggest a list of 3-5 relevant English words: "${definition}"`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        words: { type: Type.ARRAY, items: { type: Type.STRING } },
                    }
                }
            }
        });
        const parsed = JSON.parse(response.text);
        if (parsed && Array.isArray(parsed.words)) {
            return parsed.words;
        }
        console.warn("AI response for reverse dictionary was invalid, returning empty array.", parsed);
        return [];
    } catch (error) {
        console.error("Error with reverse dictionary:", error);
        return mockReverseSearchResult;
    }
};

export const getWordDetails = async (word: string): Promise<Word | null> => {
    if (!ai) {
        if (word.toLowerCase() === 'query') {
            return Promise.resolve(mockDictionaryWord);
        }
        return Promise.resolve(null); // Simulate not found for mock
    }
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Provide me with the details for the English word "${word}". If the word is not a valid English word, return an empty object. Include its pronunciation, definition, an example sentence, and a few synonyms.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        word: { type: Type.STRING },
                        pronunciation: { type: Type.STRING },
                        definition: { type: Type.STRING },
                        example: { type: Type.STRING },
                        synonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
                    }
                }
            }
        });
        const parsed = JSON.parse(response.text);
        
        if (parsed && parsed.word && parsed.pronunciation && parsed.definition && parsed.example && Array.isArray(parsed.synonyms)) {
             return { ...parsed, difficulty: 'medium' };
        } else {
            return null; // Word not found or response is malformed
        }
    } catch (error) {
        console.error(`Error fetching details for "${word}":`, error);
        throw new Error('Failed to fetch word details.');
    }
};
