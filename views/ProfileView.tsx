import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { UseVocabularyReturn } from '../hooks/useVocabulary';
import type { UseSettingsReturn } from '../hooks/useSettings';
import type { UseSocialReturn } from '../hooks/useSocial';
import SettingsView from './SettingsView';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import type { Word, User as UserType } from '../types';
import { BookCopy, Target, User, Settings, Award, X, UserPlus, UserMinus } from 'lucide-react';
import Mascot from '../components/Mascot';
import { MOCK_USERS, RANKS } from '../constants';

interface ProfileViewProps {
  vocabulary: UseVocabularyReturn;
  settingsHook: UseSettingsReturn;
  socialHook: UseSocialReturn;
}

const progressData = [
  { week: 'Week 1', learned: 10, accuracy: 75 },
  { week: 'Week 2', learned: 22, accuracy: 80 },
  { week: 'Week 3', learned: 35, accuracy: 88 },
  { week: 'Week 4', learned: 51, accuracy: 92 },
];

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="bg-base-100 p-4 rounded-xl shadow-sm flex items-center space-x-3 h-full">
        <div className="bg-primary/10 p-3 rounded-full text-primary">
            {icon}
        </div>
        <div>
            <p className="text-sm text-neutral-content">{label}</p>
            <p className="text-xl font-bold text-neutral">{value}</p>
        </div>
    </div>
);

const TabButton: React.FC<{ label: string; icon: React.ReactNode; isActive: boolean; onClick: () => void; }> = ({ label, icon, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-center space-x-2 font-semibold py-2 rounded-full transition-colors duration-300 ${
        isActive ? 'bg-primary text-white shadow' : 'text-neutral-content hover:bg-base-200'
      }`}
    >
        {icon}
        <span>{label}</span>
    </button>
  );
};

const LeaguesModal: React.FC<{onClose: () => void}> = ({ onClose }) => {
    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-40"
                onClick={onClose}
            />
            <motion.div
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-[60vh] bg-base-100 rounded-t-2xl z-50 flex flex-col p-6"
            >
                <div className="flex-shrink-0 flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-title font-bold text-neutral">All Leagues</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-base-200">
                        <X size={24} />
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto space-y-4">
                    {[...RANKS].reverse().map((rank) => {
                        const RankIcon = rank.icon;
                        return (
                            <div key={rank.name} className="flex items-center space-x-4 p-4 bg-base-200 rounded-xl">
                                <RankIcon className="w-12 h-12 flex-shrink-0" />
                                <div>
                                    <h3 className="text-xl font-bold text-primary">{rank.name}</h3>
                                    <p className="text-neutral-content">Reach {rank.minWords} words learned</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        </>
    );
};


const ProfileContent: React.FC<{ vocabulary: UseVocabularyReturn, settingsHook: UseSettingsReturn, socialHook: UseSocialReturn }> = ({ vocabulary, settingsHook, socialHook }) => {
    const { progress, bookmarkedWordsList } = vocabulary;
    const { settings } = settingsHook;
    const { addFriend, removeFriend, isFriend } = socialHook;
    const [isLeaguesModalOpen, setIsLeaguesModalOpen] = useState(false);
    const [leaderboardView, setLeaderboardView] = useState<'league' | 'friends'>('league');
    const RankIcon = progress.rank.icon;
    
    // --- Leaderboard & League Logic ---
    const currentUser: UserType = {
        id: 0, // Current user always has ID 0
        name: settings.userName,
        avatarUrl: `https://picsum.photos/seed/user0/48/48`,
        wordsLearned: progress.wordsLearned,
        isCurrentUser: true,
    };
    
    const allUsers = [...MOCK_USERS, currentUser];
    const currentLeague = progress.rank;
    const leagueIndex = RANKS.findIndex(r => r.name === currentLeague.name);
    const nextLeague = leagueIndex < RANKS.length - 1 ? RANKS[leagueIndex + 1] : null;

    let progressToNext = 0;
    if (nextLeague) {
        const wordsInCurrentLeague = progress.wordsLearned - currentLeague.minWords;
        const wordsForNextLeague = nextLeague.minWords - currentLeague.minWords;
        if (wordsForNextLeague > 0) {
          progressToNext = Math.max(0, Math.min(100, Math.round((wordsInCurrentLeague / wordsForNextLeague) * 100)));
        }
    } else {
        progressToNext = 100; // Maxed out
    }
    
    const leagueUsers = allUsers
        .filter(user => {
            const userRank = [...RANKS].reverse().find(rank => user.wordsLearned >= rank.minWords) || RANKS[0];
            return userRank.name === currentLeague.name;
        })
        .sort((a, b) => b.wordsLearned - a.wordsLearned);
        
    const friendUsers = allUsers
        .filter(user => user.isCurrentUser || isFriend(user.id))
        .sort((a, b) => b.wordsLearned - a.wordsLearned);

    const usersToShow = leaderboardView === 'league' ? leagueUsers : friendUsers;

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center p-6 bg-base-100 rounded-2xl shadow-lg">
                <div className="relative">
                    <img src={currentUser.avatarUrl} alt="User Avatar" className="w-24 h-24 rounded-full border-4 border-primary shadow-md" />
                    <RankIcon className="absolute -bottom-2 -right-2 w-10 h-10" />
                </div>
                <h2 className="mt-4 text-3xl font-title font-bold text-neutral">{settings.userName}</h2>
                <p className="text-primary font-semibold">{progress.rank.name} Rank</p>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <h3 className="text-xl font-title font-bold text-neutral mb-2">My Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                    <StatCard label="Words Learned" value={progress.wordsLearned} icon={<BookCopy size={24}/>} />
                    <StatCard label="Accuracy" value={`${progress.accuracy}%`} icon={<Target size={24} />} />
                    
                    <div className="col-span-2 bg-base-100 p-4 rounded-xl shadow-sm flex flex-col items-center text-center">
                        <h3 className="text-sm font-semibold text-neutral-content w-full text-left mb-2">Current League</h3>
                        <RankIcon className="w-20 h-20" />
                        <p className="text-2xl font-bold text-neutral mt-2">{progress.rank.name}</p>
                        
                        {nextLeague && (
                             <div className="w-full px-2 mt-3">
                                <div className="w-full bg-base-200 rounded-full h-2.5">
                                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progressToNext}%` }}></div>
                                </div>
                                <p className="text-xs text-neutral-content mt-1">
                                    {nextLeague.minWords - progress.wordsLearned} words to {nextLeague.name}
                                </p>
                            </div>
                        )}
                       
                        <button onClick={() => setIsLeaguesModalOpen(true)} className="mt-4 w-full bg-primary/10 text-primary font-bold py-2 px-4 rounded-lg hover:bg-primary/20 transition-colors flex items-center justify-center space-x-2">
                            <Award size={16} />
                            <span>View All Leagues</span>
                        </button>
                    </div>
                </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h3 className="text-xl font-title font-bold text-neutral">Leaderboard</h3>
               <div className="flex bg-base-200 p-1 rounded-full my-3">
                <button
                  onClick={() => setLeaderboardView('league')}
                  className={`w-1/2 py-1.5 text-sm font-semibold rounded-full transition-colors ${leaderboardView === 'league' ? 'bg-primary text-white shadow' : 'text-neutral-content'}`}
                >
                  My League
                </button>
                <button
                  onClick={() => setLeaderboardView('friends')}
                  className={`w-1/2 py-1.5 text-sm font-semibold rounded-full transition-colors ${leaderboardView === 'friends' ? 'bg-primary text-white shadow' : 'text-neutral-content'}`}
                >
                  Friends
                </button>
              </div>
              <div className="bg-base-100 p-2 rounded-2xl shadow-md">
                   <ul className="space-y-1 max-h-60 overflow-y-auto">
                      {usersToShow.map((user, index) => (
                          <li key={user.id} className={`flex items-center space-x-3 p-2 rounded-lg ${user.isCurrentUser ? 'bg-primary/10' : ''}`}>
                              <span className="font-bold text-lg text-neutral-content w-6 text-center">{index + 1}</span>
                              <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
                              <span className="flex-grow font-semibold text-neutral">{user.name}</span>
                              <span className="font-bold text-primary w-24 text-right">{user.wordsLearned} words</span>
                              
                              <div className="w-10">
                              {!user.isCurrentUser && (
                                  isFriend(user.id) ? (
                                    <button onClick={() => removeFriend(user.id)} className="p-2 text-error hover:bg-error/10 rounded-full" title="Remove Friend">
                                      <UserMinus size={18} />
                                    </button>
                                  ) : (
                                    <button onClick={() => addFriend(user.id)} className="p-2 text-success hover:bg-success/10 rounded-full" title="Add Friend">
                                      <UserPlus size={18} />
                                    </button>
                                  )
                              )}
                              </div>
                          </li>
                      ))}
                      {usersToShow.length === 1 && usersToShow[0].isCurrentUser && (
                          <li className="text-center p-4 text-neutral-content">
                             {leaderboardView === 'friends' ? 'Add friends from the "My League" tab!' : 'You are the only one in this league!'}
                          </li>
                      )}
                      {usersToShow.length === 0 && (
                          <li className="text-center p-4 text-neutral-content">
                             {leaderboardView === 'friends' ? 'Add some friends to see them here!' : 'There\'s nobody in this league yet!'}
                          </li>
                      )}
                   </ul>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h3 className="text-xl font-title font-bold text-neutral mb-2">Progress Over Time</h3>
              <div className="bg-base-100 p-4 rounded-2xl shadow-md h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progressData} margin={{ top: 5, right: 20, left: -20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-base-300)" />
                        <XAxis dataKey="week" tick={{ fill: 'var(--color-neutral)', opacity: 0.7 }} />
                        <YAxis yAxisId="left" stroke="var(--color-primary)" tick={{ fill: 'var(--color-primary)' }} />
                        <YAxis yAxisId="right" orientation="right" stroke="var(--color-secondary)" tick={{ fill: 'var(--color-secondary)' }} unit="%" />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--color-base-100)', border: '1px solid var(--color-base-300)', borderRadius: '0.5rem' }} />
                        <Legend verticalAlign="top" wrapperStyle={{paddingBottom: '20px'}}/>
                        <Line yAxisId="left" type="monotone" dataKey="learned" name="Words Learned" stroke="var(--color-primary)" strokeWidth={3} />
                        <Line yAxisId="right" type="monotone" dataKey="accuracy" name="Accuracy" stroke="var(--color-secondary)" strokeWidth={3} />
                    </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <h3 className="text-xl font-title font-bold text-neutral mb-2">Bookmarked Words</h3>
                <div className="bg-base-100 p-4 rounded-2xl shadow-md min-h-[18rem] flex flex-col justify-center">
                    {bookmarkedWordsList.length > 0 ? (
                         <ul className="divide-y divide-base-200 max-h-60 overflow-y-auto">
                            {bookmarkedWordsList.map((word: Word) => (
                                <li key={word.word} className="py-3">
                                    <p className="font-bold text-primary">{word.word}</p>
                                    <p className="text-sm text-neutral-content">{word.definition}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-4">
                           <Mascot message="Bookmark words you find tricky or interesting to review them here!" />
                        </div>
                    )}
                </div>
            </motion.div>
            <AnimatePresence>
                {isLeaguesModalOpen && <LeaguesModal onClose={() => setIsLeaguesModalOpen(false)} />}
            </AnimatePresence>
        </div>
    )
}

const ProfileView: React.FC<ProfileViewProps> = ({ vocabulary, settingsHook, socialHook }) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-title font-bold text-neutral">Profile</h1>
            </div>
            
            <div className="flex bg-base-100 p-1 rounded-full shadow-inner">
                <TabButton
                    label="Overview"
                    icon={<User size={18}/>}
                    isActive={activeTab === 'profile'}
                    onClick={() => setActiveTab('profile')}
                />
                <TabButton
                    label="Settings"
                    icon={<Settings size={18}/>}
                    isActive={activeTab === 'settings'}
                    onClick={() => setActiveTab('settings')}
                />
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'profile' ? (
                        <ProfileContent vocabulary={vocabulary} settingsHook={settingsHook} socialHook={socialHook} />
                    ) : (
                        <SettingsView settingsHook={settingsHook} />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default ProfileView;