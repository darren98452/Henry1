
import { useState, useMemo, useEffect } from 'react';
import type { Word, UserProgress, Rank, SrsData } from '../types';
import { INITIAL_WORDS, RANKS } from '../constants';

const VOCAB_STORAGE_KEY = 'vocab-ai-trainer-vocabulary';

const createInitialSrsData = (date: Date = new Date()): SrsData => {
    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {
        lastReviewed: date.toISOString(),
        nextReview: tomorrow.toISOString(),
        interval: 1,
        easeFactor: 2.5,
        repetition: 0,
    };
};


export const useVocabulary = () => {
    const [words, setWords] = useState<Word[]>(() => {
        try {
            const storedWords = localStorage.getItem(VOCAB_STORAGE_KEY);
            if (storedWords) {
                // Basic validation, could be more robust
                const parsed = JSON.parse(storedWords);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch (error) {
            console.error("Failed to parse vocabulary from localStorage", error);
        }
        return INITIAL_WORDS;
    });

    const [bookmarkedWords, setBookmarkedWords] = useState<Set<string>>(new Set(['Serendipity']));
    const [totalCorrect, setTotalCorrect] = useState(15);
    const [totalAnswered, setTotalAnswered] = useState(18);

    useEffect(() => {
        localStorage.setItem(VOCAB_STORAGE_KEY, JSON.stringify(words));
    }, [words]);

    const learnedWordsList = useMemo(() => words.filter(w => w.srsData), [words]);
    const learnedWords = useMemo(() => new Set(learnedWordsList.map(w => w.word)), [learnedWordsList]);
    
    const wordsToLearn = useMemo(() => words.filter(w => !w.srsData), [words]);
    
    const wordsToReview = useMemo(() => {
        const today = new Date();
        return learnedWordsList.filter(w => w.srsData && new Date(w.srsData.nextReview) <= today);
    }, [learnedWordsList]);
    
    const bookmarkedWordsList = useMemo(() => {
        return words.filter(word => bookmarkedWords.has(word.word));
    }, [words, bookmarkedWords]);

    const updateWord = (wordIdentifier: string, newWordData: Partial<Word>) => {
        setWords(prevWords => prevWords.map(w => 
            w.word === wordIdentifier ? { ...w, ...newWordData } : w
        ));
    };

    const markAsLearned = (wordIdentifier: string) => {
        const word = words.find(w => w.word === wordIdentifier);
        if (word && !word.srsData) {
            updateWord(wordIdentifier, { srsData: createInitialSrsData() });
        }
    };
    
    const recordQuizResult = (wordIdentifier: string, isCorrect: boolean) => {
        setTotalAnswered(prev => prev + 1);
        if (isCorrect) {
            setTotalCorrect(prev => prev + 1);
        }

        const word = words.find(w => w.word === wordIdentifier);
        if (!word) return;

        let currentSrs = word.srsData;

        // If the word has never been reviewed, initialize its SRS data
        if (!currentSrs) {
            currentSrs = createInitialSrsData();
        } else {
            currentSrs = { ...currentSrs }; // create a copy to modify
        }
        
        currentSrs.lastReviewed = new Date().toISOString();

        if (isCorrect) {
            // Correct answer: increase interval based on SM-2 logic
            currentSrs.repetition += 1;
            
            if (currentSrs.repetition === 1) {
                currentSrs.interval = 1;
            } else if (currentSrs.repetition === 2) {
                currentSrs.interval = 6;
            } else {
                currentSrs.interval = Math.ceil(currentSrs.interval * currentSrs.easeFactor);
            }
            // Adjust ease factor slightly
            currentSrs.easeFactor = Math.max(1.3, currentSrs.easeFactor + 0.1);
        } else {
            // Incorrect answer: reset progress
            currentSrs.repetition = 0;
            currentSrs.interval = 1;
            // Penalize ease factor
            currentSrs.easeFactor = Math.max(1.3, currentSrs.easeFactor - 0.2);
        }

        const nextReviewDate = new Date();
        nextReviewDate.setDate(nextReviewDate.getDate() + currentSrs.interval);
        currentSrs.nextReview = nextReviewDate.toISOString();

        updateWord(wordIdentifier, { srsData: currentSrs });
    };

    const toggleBookmark = (wordIdentifier: string) => {
        setBookmarkedWords(prev => {
            const newSet = new Set(prev);
            if (newSet.has(wordIdentifier)) {
                newSet.delete(wordIdentifier);
            } else {
                newSet.add(wordIdentifier);
            }
            return newSet;
        });
    };

    const progress: UserProgress = useMemo(() => {
        const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
        const wordsLearnedCount = learnedWords.size;
        const currentRank = [...RANKS].reverse().find(rank => wordsLearnedCount >= rank.minWords) || RANKS[0];
        return {
            wordsLearned: wordsLearnedCount,
            accuracy,
            rank: currentRank,
        };
    }, [learnedWords.size, totalCorrect, totalAnswered]);


    return {
        allWords: words,
        wordsToLearn,
        learnedWords,
        learnedWordsList,
        wordsToReview,
        bookmarkedWords,
        bookmarkedWordsList,
        progress,
        markAsLearned,
        toggleBookmark,
        recordQuizResult
    };
};

export type UseVocabularyReturn = ReturnType<typeof useVocabulary>;
