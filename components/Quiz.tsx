import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateQuizQuestion } from '../services/geminiService';
import type { QuizQuestion, Word } from '../types';
import type { UseVocabularyReturn } from '../hooks/useVocabulary';
import Loader from './Loader';
import StarRating from './StarRating';

interface QuizProps {
  vocabulary: UseVocabularyReturn;
  onFinish: () => void;
}

const QUIZ_LENGTH = 5;

const Quiz: React.FC<QuizProps> = ({ vocabulary, onFinish }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    // Prioritize words due for review
    let wordsForQuiz = [...vocabulary.wordsToReview];
    
    // If not enough words to review, add some other learned words
    if (wordsForQuiz.length < QUIZ_LENGTH) {
        const otherLearnedWords = vocabulary.learnedWordsList
            .filter(w => !wordsForQuiz.some(reviewWord => reviewWord.word === w.word)) // Exclude words already in the review list
            .sort(() => 0.5 - Math.random()); // Shuffle
        
        wordsForQuiz.push(...otherLearnedWords.slice(0, QUIZ_LENGTH - wordsForQuiz.length));
    }

    // If still not enough, add any word (for new users)
    if (wordsForQuiz.length < QUIZ_LENGTH) {
        const anyOtherWords = vocabulary.allWords
            .filter(w => !wordsForQuiz.some(quizWord => quizWord.word === w.word)) // Exclude all words already selected
            .sort(() => 0.5 - Math.random());
        
        wordsForQuiz.push(...anyOtherWords.slice(0, QUIZ_LENGTH - wordsForQuiz.length));
    }
    
    // Ensure we don't exceed quiz length and handle case where there are no words
    wordsForQuiz = wordsForQuiz.slice(0, QUIZ_LENGTH);
    if (wordsForQuiz.length === 0) {
        setIsLoading(false);
        setQuestions([]);
        return;
    }

    const generatedQuestions = await Promise.all(
        wordsForQuiz.map(word => generateQuizQuestion(word))
    );
    setQuestions(generatedQuestions);
    setIsLoading(false);
  }, [vocabulary.wordsToReview, vocabulary.learnedWordsList, vocabulary.allWords]);

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnswer = (option: string) => {
    if (isAnswered) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = option === currentQuestion.correctAnswer;
    setSelectedAnswer(option);
    setIsAnswered(true);

    // Report result to the SRS hook
    vocabulary.recordQuizResult(currentQuestion.word, isCorrect);
    
    if (isCorrect) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    setIsAnswered(false);
    setSelectedAnswer(null);
    setCurrentQuestionIndex(i => i + 1);
  };
  
  if (isLoading) {
    return <Loader message="Preparing your quiz..." />;
  }

  if (questions.length === 0) {
      return (
          <div className="text-center p-8 bg-base-100 rounded-lg shadow-md">
              <p className="text-slate-700">Could not load quiz questions. Please try again later.</p>
              <button onClick={onFinish} className="mt-4 bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-focus transition-colors">
                  Back to Practice
              </button>
          </div>
      );
  }

  if (currentQuestionIndex >= questions.length) { // Use questions.length instead of QUIZ_LENGTH
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8 bg-base-100 rounded-lg shadow-xl animate-fade-in">
        <h2 className="text-3xl font-title font-bold text-primary mb-4">Quiz Complete!</h2>
        <p className="text-xl text-slate-800 mb-2">You scored</p>
        <p className="text-5xl font-extrabold text-secondary mb-6">{score} / {questions.length}</p>
        <StarRating score={score} total={questions.length} />
        <p className="mt-6 text-slate-600">Your progress has been updated.</p>
        <button onClick={onFinish} className="mt-8 w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-focus transition-colors text-lg">
          Finish
        </button>
      </motion.div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const incorrectAnswer = isAnswered && selectedAnswer !== currentQuestion.correctAnswer;

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-title font-bold text-primary">Quiz Time!</h2>
        <p className="font-semibold text-slate-600">{currentQuestionIndex + 1} / {questions.length}</p>
      </div>
      <div className="bg-base-100 p-6 rounded-lg shadow-md">
        <AnimatePresence mode="wait">
        <motion.div 
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
        >
            <p className="text-lg text-slate-800 font-medium mb-6 min-h-[5em]">{currentQuestion.definition}</p>
            <div className="space-y-3">
            {currentQuestion.options.map((option) => {
                const isCorrectAnswer = option === currentQuestion.correctAnswer;
                const isSelected = option === selectedAnswer;
                let buttonClass = 'border-base-300 bg-base-100 hover:bg-base-200';
                if(isAnswered) {
                    if (isCorrectAnswer) {
                        buttonClass = 'bg-success/20 border-success text-success-content font-bold';
                    } else if (isSelected) {
                        buttonClass = 'bg-error/20 border-error text-error-content';
                    } else {
                        buttonClass = 'border-base-300 bg-base-100 opacity-60';
                    }
                }

                return (
                    <button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    disabled={isAnswered}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${buttonClass}`}
                    >
                    {option}
                    </button>
                );
            })}
            </div>
        </motion.div>
        </AnimatePresence>
        
        <AnimatePresence>
          {incorrectAnswer && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-warning/10 border-l-4 border-warning rounded-r-lg">
                  <div className="flex">
                      <div className="flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-warning"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                      </div>
                      <div className="ml-3">
                          <h3 className="text-sm font-bold text-neutral">
                              The correct answer is: {currentQuestion.correctAnswer}
                          </h3>
                          <div className="mt-2 text-sm text-slate-700">
                              <p>{currentQuestion.explanation}</p>
                          </div>
                      </div>
                  </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isAnswered && (
          <motion.button 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={handleNext} 
            className="mt-6 w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-focus transition-colors"
          >
            Next
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default Quiz;