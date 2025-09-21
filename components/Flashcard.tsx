import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import type { Word } from '../types';
import Mascot from './Mascot';

interface FlashcardProps {
  word: Word;
  isBookmarked: boolean;
  onBookmark: (word: string) => void;
  onRate: (wordIdentifier: string, isCorrect: boolean) => void;
}

const mascotVariants: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  swipeRight: {
    x: ['110%', '40%', '-110%'],
    y: ['50%', '50%', '50%'],
    rotate: [-30, 10, 40],
    opacity: [0, 1, 0],
    scale: [0.5, 1, 0.5],
    transition: { duration: 0.8, ease: 'easeInOut', times: [0, 0.4, 1] }
  },
  swipeLeft: {
    x: ['-110%', '60%', '110%'],
    y: ['50%', '50%', '50%'],
    rotate: [40, -10, -30],
    opacity: [0, 1, 0],
    scale: [0.5, 1, 0.5],
    transition: { duration: 0.8, ease: 'easeInOut', times: [0, 0.4, 1] }
  },
}

const Flashcard: React.FC<FlashcardProps> = ({ word, isBookmarked, onBookmark, onRate }) => {
  const [rotation, setRotation] = useState(0); // Use rotation state instead of isFlipped
  const [isAnimating, setIsAnimating] = useState(false);
  const [mascotAnimation, setMascotAnimation] = useState<'hidden' | 'swipeRight' | 'swipeLeft'>('hidden');

  // When a new card appears, ensure it's facing front.
  useEffect(() => {
    // Animate back to the closest "front-facing" rotation (0, 360, -360, etc.)
    setRotation(Math.round(rotation / 360) * 360);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word]);

  const handleFlip = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    
    // Randomly decide which way the mascot will come from
    const flipDirection = Math.random() < 0.5 ? 1 : -1; // 1 for right->left, -1 for left->right
    
    setMascotAnimation(flipDirection === 1 ? 'swipeRight' : 'swipeLeft');
    
    // The delay should be slightly less than the mascot's animation start time
    setTimeout(() => {
        // Update rotation to flip the card
        setRotation(prev => prev + (180 * flipDirection));
    }, 150);

    // The animation timeout should match the total mascot animation duration
    setTimeout(() => {
        setIsAnimating(false);
        setMascotAnimation('hidden');
    }, 800);
  };
  
  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Sorry, your browser doesn't support text-to-speech.");
    }
  };

  return (
    <div className="w-full h-80 [perspective:1000px] relative cursor-pointer" onClick={handleFlip}>
        <motion.div
            className="absolute z-20 w-24 h-24"
            style={{ top: '50%', left: '50%', x: '-50%', y: '-50%' }}
            variants={mascotVariants}
            animate={mascotAnimation}
        >
            <Mascot size="sm" />
        </motion.div>
        
        <motion.div
            className="relative w-full h-full [transform-style:preserve-3d]"
            initial={false}
            animate={{ rotateY: rotation }} // Animate based on the rotation state
            transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
            {/* Front of the card */}
            <div className="absolute w-full h-full [backface-visibility:hidden] bg-base-100 rounded-2xl shadow-lg flex flex-col justify-center items-center p-6 text-center">
                <h2 className="text-4xl font-bold text-primary">{word.word}</h2>
                <div className="flex items-center space-x-2 mt-2">
                    <p className="text-neutral-content">{word.pronunciation}</p>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleSpeak(word.word);
                        }}
                        className="text-neutral-content hover:text-primary transition-colors p-1"
                        aria-label="Listen to pronunciation"
                    >
                        <Volume2 size={22} />
                    </button>
                </div>
                <p className="mt-8 text-sm text-neutral-content opacity-75">Tap to see meaning</p>
                 <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onBookmark(word.word);
                    }}
                    className="absolute top-4 right-4 text-neutral-content hover:text-amber-500"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isBookmarked ? "#f59e0b" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bookmark"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                </button>
            </div>

            {/* Back of the card */}
            <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-primary text-white rounded-2xl shadow-lg flex flex-col p-6">
                <div className="flex-grow overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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