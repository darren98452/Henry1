import { GoogleGenAI, Type } from '@google/genai';
import type { QuizQuestion, SwipeItem, Word } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Using a mock service.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

// --- MOCK IMPLEMENTATIONS ---
const mockWord: Word = {
    word: "Lexicographer",
    pronunciation: "/ˌlɛksɪˈkɒɡrəfər/",
    definition: "A person who compiles dictionaries.",
    example: "The lexicographer diligently updated the new edition of the dictionary.",
    synonyms: ["word-smith", "glossologist", "dictionary-maker"],
    difficulty: 'medium'
};

const mockDictionaryWord: Word = {
    word: "Query",
    pronunciation: "/ˈkwɪəri/",
    definition: "A question, especially one addressed to an official or organization.",
    example: "The journalist posed a sharp query to the politician.",
    synonyms: ["question", "inquiry", "interrogation"],
    difficulty: 'easy',
};

const mockQuizQuestion: QuizQuestion = {
    word: 'Ephemeral',
    definition: 'Lasting for a very short time.',
    options: ['Ephemeral', 'Eternal', 'Ubiquitous', 'Ancient'],
    correctAnswer: 'Ephemeral',
    explanation: 'Ephemeral means "lasting for a very short time," which directly matches the definition provided.'
};

const mockSwipeItem: SwipeItem = {
    word1: "Happy",
    word2: "Joyful",
    areSynonyms: true
};

const mockReverseSearchResult = ["Vocabulary", "Lexicon", "Glossary"];

interface Quote {
  quote: string;
  author: string;
}

const mockQuote: Quote = {
    quote: "The limits of my language mean the limits of my world.",
    author: "Ludwig Wittgenstein"
};

// --- API Service ---

export const getWordOfTheDay = async (): Promise<Word> => {
    if (!ai) return Promise.resolve(mockWord);
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Provide me with an interesting English vocabulary word that is not too obscure. Include its pronunciation, definition, an example sentence, and a few synonyms.",
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
        
        // Validate that the parsed object from the AI has all the required fields.
        if (parsed && parsed.word && parsed.definition && parsed.example && parsed.pronunciation && Array.isArray(parsed.synonyms)) {
             return { ...parsed, difficulty: 'medium' };
        } else {
            console.warn("AI response for Word of the Day was incomplete, falling back to mock word.", parsed);
            return mockWord;
        }

    } catch (error) {
        console.error("Error fetching Word of the Day:", error);
        return mockWord; // Fallback to mock on error
    }
};

export const getVocabularyQuote = async (): Promise<Quote> => {
    if (!ai) return Promise.resolve(mockQuote);
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Provide a short, inspiring quote about words, vocabulary, or language from a famous author or novel.",
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        quote: { type: Type.STRING },
                        author: { type: Type.STRING },
                    }
                }
            }
        });
        const parsed = JSON.parse(response.text);
        
        if (parsed && parsed.quote && parsed.author) {
             return parsed;
        } else {
            console.warn("AI response for Quote of the Day was incomplete, falling back to mock quote.", parsed);
            return mockQuote;
        }

    } catch (error) {
        console.error("Error fetching Quote of the Day:", error);
        return mockQuote; // Fallback to mock on error
    }
};

export const generateQuizQuestion = async (word: Word): Promise<QuizQuestion> => {
    const fallbackExplanation = `The correct answer is "${word.word}" as it means "${word.definition}".`;
    if (!ai) return Promise.resolve({ ...mockQuizQuestion, word: word.word, explanation: fallbackExplanation });
    try {
        const prompt = `Create a multiple-choice question to test the user's knowledge of the word "${word.word}". The definition is: "${word.definition}". Provide three plausible incorrect options and include the correct word as one of the options. The options should be single words. Also, provide a brief, one-sentence explanation for why the correct answer is correct, linking it back to the definition.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING, description: "The definition of the word, posed as a question." },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        correctAnswer: { type: Type.STRING },
                        explanation: { type: Type.STRING, description: "A brief explanation for why the correct answer is correct." }
                    }
                }
            }
        });
        const parsed = JSON.parse(response.text);

        if (parsed && parsed.question && Array.isArray(parsed.options) && parsed.correctAnswer) {
             return {
                word: word.word,
                definition: parsed.question,
                options: parsed.options,
                correctAnswer: parsed.correctAnswer,
                explanation: parsed.explanation || fallbackExplanation,
            };
        } else {
            console.warn("AI response for quiz question was incomplete, falling back to mock.", parsed);
            return { ...mockQuizQuestion, word: word.word, explanation: fallbackExplanation };
        }
    } catch (error) {
        console.error("Error generating quiz question:", error);
        return { ...mockQuizQuestion, word: word.word, explanation: fallbackExplanation }; // Fallback to mock
    }
};

export const getSynonymAntonymPair = async (): Promise<SwipeItem> => {
    if (!ai) return Promise.resolve(mockSwipeItem);
    try {
        const prompt = `Generate two English words. With a 50% probability, they should be synonyms. With a 50% probability, they should be antonyms or unrelated. Don't pick extremely obscure words.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        word1: { type: Type.STRING },
                        word2: { type: Type.STRING },
                        areSynonyms: { type: Type.BOOLEAN, description: "True if the words are synonyms, false otherwise." },
                    }
                }
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error generating swipe pair:", error);
        return mockSwipeItem;
    }
};

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