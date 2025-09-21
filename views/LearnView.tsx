import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { UseVocabularyReturn } from '../hooks/useVocabulary';
import Flashcard from '../components/Flashcard';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Mascot from '../components/Mascot';

interface LearnViewProps {
  vocabulary: UseVocabularyReturn;
}

const LearnView: React.FC<LearnViewProps> = ({ vocabulary }) => {
  const { wordsToLearn, bookmarkedWords, toggleBookmark, recordQuizResult } = vocabulary;
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < wordsToLearn.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  
  const handleRate = (wordIdentifier: string, isCorrect: boolean) => {
    recordQuizResult(wordIdentifier, isCorrect);
    // After rating, the word is removed from `wordsToLearn`.
    // If we are at the end of the list, we need to move back to the new last item.
    if (wordsToLearn.length > 1 && currentIndex >= wordsToLearn.length - 1) {
      setCurrentIndex(currentIndex - 1);
    }
    // Otherwise, the next word will slide into the current index, so no index change is needed.
  };

  const currentWord = wordsToLearn[currentIndex];

  if (wordsToLearn.length === 0) {
    return (
      <div className="text-center p-8 flex flex-col items-center justify-center h-[calc(100vh-112px)]">
        <Mascot message="You're a vocabulary superstar! You've learned everything for now." />
        <h2 className="text-2xl font-bold text-success mt-4 mb-2">Congratulations!</h2>
        <p className="text-neutral-content">Check back later for more words.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-112px)]">
      <h1 className="flex-shrink-0 text-2xl font-title font-bold text-neutral mb-4 text-center">Learn New Words</h1>
      <div className="flex-grow flex flex-col items-center justify-center">
         <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
                <Flashcard 
                    word={currentWord} 
                    isBookmarked={bookmarkedWords.has(currentWord.word)}
                    onBookmark={toggleBookmark}
                    onRate={handleRate}
                />
            </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex-shrink-0 pt-4">
        <div className="flex justify-center items-center">
            <button onClick={handlePrev} disabled={currentIndex === 0} className="p-3 rounded-full bg-base-100 shadow-md disabled:opacity-50">
            <ArrowLeft className="text-primary" />
            </button>
            <p className="mx-6 font-semibold text-neutral-content">{currentIndex + 1} / {wordsToLearn.length}</p>
            <button onClick={handleNext} disabled={currentIndex === wordsToLearn.length - 1} className="p-3 rounded-full bg-base-100 shadow-md disabled:opacity-50">
            <ArrowRight className="text-primary" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default LearnView;