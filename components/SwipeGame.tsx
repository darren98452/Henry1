import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSynonymAntonymPair } from '../services/geminiService';
import type { SwipeItem } from '../types';
import Loader from './Loader';

interface SwipeGameProps {
  onFinish: () => void;
}

const GAME_LENGTH = 10;

const SwipeGame: React.FC<SwipeGameProps> = ({ onFinish }) => {
    const [card, setCard] = useState<SwipeItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [round, setRound] = useState(0);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

    const fetchNextCard = useCallback(async () => {
        setFeedback(null);
        setIsLoading(true);
        const nextCard = await getSynonymAntonymPair();
        setCard(nextCard);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchNextCard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSwipe = (isSynonymSwipe: boolean) => {
        if (!card) return;

        const isCorrect = isSynonymSwipe === card.areSynonyms;
        if (isCorrect) {
            setScore(s => s + 1);
            setFeedback('correct');
        } else {
            setFeedback('incorrect');
        }

        setTimeout(() => {
            if (round + 1 < GAME_LENGTH) {
                setRound(r => r + 1);
                fetchNextCard();
            } else {
                setRound(r => r + 1); // To trigger end screen
            }
        }, 1000);
    };
    
    if (round >= GAME_LENGTH) {
      return (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8 bg-base-100 rounded-lg shadow-xl animate-fade-in">
          <h2 className="text-3xl font-title font-bold text-primary mb-4">Game Over!</h2>
          <p className="text-xl text-slate-800 mb-2">You scored</p>
          <p className="text-5xl font-extrabold text-secondary mb-6">{score} / {GAME_LENGTH}</p>
          <button onClick={onFinish} className="mt-8 w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-focus transition-colors text-lg">
            Finish
          </button>
        </motion.div>
      );
    }

    return (
        <div className="w-full flex flex-col items-center">
            <h2 className="text-2xl font-title font-bold text-primary mb-2">Synonym Swipe</h2>
            <p className="text-slate-600 mb-4">{round + 1} / {GAME_LENGTH}</p>
             <div className="relative w-full h-80">
                <AnimatePresence>
                    {isLoading ? (
                        <motion.div key="loader" exit={{ opacity: 0 }} className="absolute inset-0 flex justify-center items-center">
                             <Loader message="Loading pair..." />
                        </motion.div>
                    ) : card && (
                        <motion.div
                            key={round}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ x: feedback === 'correct' ? 500 : -500, opacity: 0, rotate: feedback === 'correct' ? 30 : -30 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                            className={`w-full h-full bg-base-100 rounded-2xl shadow-lg flex flex-col justify-center items-center p-6 text-center
                                ${feedback === 'correct' ? 'border-4 border-success' : ''}
                                ${feedback === 'incorrect' ? 'border-4 border-error' : ''}
                            `}
                        >
                            <h3 className="text-4xl font-bold text-primary">{card.word1}</h3>
                            <div className="my-4 h-px w-1/2 bg-base-300"></div>
                            <h3 className="text-4xl font-bold text-slate-700">{card.word2}</h3>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="mt-8 w-full flex justify-around">
                 <button
                    onClick={() => handleSwipe(false)}
                    disabled={feedback !== null}
                    className="w-24 h-24 rounded-full bg-base-100 shadow-lg flex items-center justify-center text-error hover:bg-error/10 transition-colors disabled:opacity-50"
                    aria-label="Not Synonyms"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                <button
                    onClick={() => handleSwipe(true)}
                    disabled={feedback !== null}
                    className="w-24 h-24 rounded-full bg-base-100 shadow-lg flex items-center justify-center text-success hover:bg-success/10 transition-colors disabled:opacity-50"
                    aria-label="Are Synonyms"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </button>
            </div>
             <p className="mt-4 text-slate-600">Are these words synonyms?</p>
        </div>
    );
};

export default SwipeGame;