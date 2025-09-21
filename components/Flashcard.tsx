import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import type { Word } from '../types';

interface FlashcardProps {
  word: Word;
  isBookmarked: boolean;
  onBookmark: (word: string) => void;
  onRate: (wordIdentifier: string, isCorrect: boolean) => void;
}

const Flashcard: React.FC<FlashcardProps> = ({ word, isBookmarked, onBookmark, onRate }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // When a new card appears, ensure it's facing front.
  React.useEffect(() => {
    setIsFlipped(false);
  }, [word]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };
  
  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech to prevent overlap
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US'; // Set language for better pronunciation
      window.speechSynthesis.speak(utterance);
    } else {
      // Basic fallback for browsers that don't support the API
      alert("Sorry, your browser doesn't support text-to-speech.");
    }
  };

  return (
    <div className="w-full h-80 [perspective:1000px]">
        <motion.div
            className="relative w-full h-full [transform-style:preserve-3d]"
            initial={false}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6 }}
            onClick={handleFlip}
        >
            {/* Front of the card */}
            <div className="absolute w-full h-full [backface-visibility:hidden] bg-base-100 rounded-2xl shadow-lg flex flex-col justify-center items-center p-6 text-center cursor-pointer">
                <h2 className="text-4xl font-bold text-primary">{word.word}</h2>
                <div className="flex items-center space-x-2 mt-2">
                    <p className="text-slate-600">{word.pronunciation}</p>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleSpeak(word.word);
                        }}
                        className="text-slate-500 hover:text-primary transition-colors p-1"
                        aria-label="Listen to pronunciation"
                    >
                        <Volume2 size={22} />
                    </button>
                </div>
                <p className="mt-8 text-sm text-slate-500">Tap to see meaning</p>
                 <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onBookmark(word.word);
                    }}
                    className="absolute top-4 right-4 text-slate-500 hover:text-amber-500"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isBookmarked ? "#f59e0b" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bookmark"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                </button>
            </div>

            {/* Back of the card */}
            <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-primary text-white rounded-2xl shadow-lg flex flex-col p-6 cursor-pointer">
                <div className="flex-grow overflow-y-auto">
                    <h3 className="text-xl font-bold border-b border-white/50 pb-2">{word.definition}</h3>
                    <p className="italic mt-4 text-sm">"{word.example}"</p>
                    <div className="mt-4">
                        <p className="font-semibold">Synonyms:</p>
                        <p className="text-sm">{word.synonyms.join(', ')}</p>
                    </div>
                </div>
                 <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onBookmark(word.word);
                    }}
                    className="absolute top-4 right-4 text-white/80 hover:text-white"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isBookmarked ? "white" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bookmark"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                </button>
                <div className="flex-shrink-0 flex justify-around items-center pt-4 border-t border-white/30 mt-4">
                    <button onClick={(e) => { e.stopPropagation(); onRate(word.word, false); }} className="px-5 py-2 font-semibold rounded-lg bg-white/20 hover:bg-white/30 transition-colors">Hard</button>
                    <button onClick={(e) => { e.stopPropagation(); onRate(word.word, true); }} className="px-5 py-2 font-semibold rounded-lg bg-white/20 hover:bg-white/30 transition-colors">Good</button>
                    <button onClick={(e) => { e.stopPropagation(); onRate(word.word, true); }} className="px-5 py-2 font-semibold rounded-lg bg-white/20 hover:bg-white/30 transition-colors">Easy</button>
                </div>
            </div>
        </motion.div>
    </div>
  );
};

export default Flashcard;