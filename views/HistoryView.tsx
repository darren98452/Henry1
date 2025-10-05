import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Gamepad2, Shuffle, Ear, Puzzle, Trash2, X } from 'lucide-react';
import type { UsePracticeHistoryReturn } from '../hooks/usePracticeHistory';
import type { PracticeSession } from '../types';
import Mascot from '../components/Mascot';

interface HistoryViewProps {
  practiceHistoryHook: UsePracticeHistoryReturn;
}

const gameTypeDetails = {
    'Quiz': { icon: Brain, color: 'text-primary' },
    'Synonym Swipe': { icon: Gamepad2, color: 'text-secondary' },
    'Word Scramble': { icon: Shuffle, color: 'text-accent' },
    'Spelling Bee': { icon: Ear, color: 'text-primary' },
    'Wordle': { icon: Puzzle, color: 'text-secondary' }
};

const HistoryItem: React.FC<{ session: PracticeSession }> = ({ session }) => {
    const details = gameTypeDetails[session.type];
    const Icon = details.icon;

    const formattedDate = new Date(session.date).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric'
    });

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex items-center space-x-4 bg-base-100 p-4 rounded-xl shadow-sm"
        >
            <div className={`p-3 rounded-full bg-base-200 ${details.color}`}>
                <Icon size={24} />
            </div>
            <div className="flex-grow">
                <p className="font-bold text-neutral">{session.type}</p>
                <p className="text-sm text-neutral-content">{formattedDate}</p>
            </div>
            <p className={`font-extrabold text-xl ${details.color}`}>
                {session.total > 1 ? `${session.score}/${session.total}` : (session.score === 1 ? 'Win' : 'Loss')}
            </p>
        </motion.div>
    );
};

const HistoryView: React.FC<HistoryViewProps> = ({ practiceHistoryHook }) => {
    const { history, clearHistory } = practiceHistoryHook;
    const [showConfirm, setShowConfirm] = useState(false);

    const handleClear = () => {
        clearHistory();
        setShowConfirm(false);
    };

    if (history.length === 0) {
        return (
            <div className="text-center p-8 flex flex-col items-center justify-center min-h-[50vh]">
                <Mascot message="Your practice history will appear here once you complete a quiz or a game." />
                <h3 className="text-xl font-bold text-neutral mt-4 mb-2">No History Yet</h3>
                <p className="text-neutral-content">Head over to the Practice Zone to test your skills!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-title font-bold text-neutral">Practice History</h3>
                <button
                    onClick={() => setShowConfirm(true)}
                    className="flex items-center space-x-2 text-sm font-semibold text-error hover:bg-error/10 px-3 py-2 rounded-lg transition-colors"
                >
                    <Trash2 size={16} />
                    <span>Clear History</span>
                </button>
            </div>

            <div className="space-y-3">
                <AnimatePresence>
                    {history.map(session => <HistoryItem key={session.id} session={session} />)}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {showConfirm && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 z-40"
                            onClick={() => setShowConfirm(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-base-100 rounded-2xl z-50 p-6 shadow-xl"
                        >
                            <h3 className="text-lg font-bold text-neutral">Are you sure?</h3>
                            <p className="text-neutral-content mt-2 mb-6">This will permanently delete your practice history. This action cannot be undone.</p>
                            <div className="flex justify-end space-x-3">
                                <button onClick={() => setShowConfirm(false)} className="px-4 py-2 font-semibold bg-base-200 rounded-lg hover:bg-base-300 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={handleClear} className="px-4 py-2 font-semibold bg-error text-white rounded-lg hover:bg-red-700 transition-colors">
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HistoryView;
