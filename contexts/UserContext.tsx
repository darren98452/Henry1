import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { UserData, Word, Settings, PracticeSession } from '../types';
import type { ThemeName } from '../hooks/useSettings';
import api from '../services/apiService';

interface UserContextType {
  userData: UserData | null;
  isLoading: boolean;
  error: string | null;
  fetchNewWords: () => Promise<void>;
  toggleBookmark: (wordIdentifier: string) => Promise<void>;
  recordQuizResult: (wordIdentifier: string, quality: number) => Promise<void>;
  addPracticeSession: (sessionData: Omit<PracticeSession, 'id' | 'date'>) => Promise<void>;
  clearHistory: () => Promise<void>;
  setTheme: (theme: ThemeName) => Promise<void>;
  setUserName: (name: string) => Promise<void>;
  addFriend: (id: number) => Promise<void>;
  removeFriend: (id: number) => Promise<void>;
}

export const UserContext = createContext<UserContextType>({
    userData: null,
    isLoading: true,
    error: null,
    fetchNewWords: async () => {},
    toggleBookmark: async () => {},
    recordQuizResult: async () => {},
    addPracticeSession: async () => {},
    clearHistory: async () => {},
    setTheme: async () => {},
    setUserName: async () => {},
    addFriend: async () => {},
    removeFriend: async () => {},
});

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await api.getUserData();
                setUserData(data);
            } catch (e) {
                setError("Failed to load user data. Please try again later.");
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);
    
    const fetchNewWords = useCallback(async () => {
        if (!userData) return;
        try {
            const newWords = await api.generateNewWords(5); // Fetch 5 new words
            setUserData(d => d ? { ...d, words: [...d.words, ...newWords] } : null);
        } catch (e) {
            console.error("Failed to fetch new words", e);
        }
    }, [userData]);

    const recordQuizResult = useCallback(async (wordIdentifier: string, quality: number) => {
        if (!userData) return;

        const originalWords = userData.words;
        const originalStats = userData.quizStats;
        
        try {
            const updatedWord = await api.recordInteraction(wordIdentifier, quality);
            // After backend processing, update the entire user state
            setUserData(d => {
                if (!d) return null;
                const newWords = d.words.map(w => w.word === wordIdentifier ? updatedWord : w);
                const newStats = {
                    totalAnswered: d.quizStats.totalAnswered + 1,
                    totalCorrect: d.quizStats.totalCorrect + (quality >= 3 ? 1 : 0),
                };
                return { ...d, words: newWords, quizStats: newStats };
            });
        } catch (e) {
            // Revert on failure
            setUserData(d => d ? { ...d, words: originalWords, quizStats: originalStats } : null);
            console.error("Failed to record interaction", e);
        }
    }, [userData]);
    
    const toggleBookmark = useCallback(async (wordIdentifier: string) => {
        if (!userData) return;
        const originalBookmarks = userData.bookmarkedWords;
        
        const newBookmarks = originalBookmarks.includes(wordIdentifier)
            ? originalBookmarks.filter(w => w !== wordIdentifier)
            : [...originalBookmarks, wordIdentifier];

        setUserData(d => d ? { ...d, bookmarkedWords: newBookmarks } : null);
        
        try {
            await api.toggleBookmark(wordIdentifier);
        } catch (e) {
            setUserData(d => d ? { ...d, bookmarkedWords: originalBookmarks } : null);
            console.error("Failed to toggle bookmark", e);
        }
    }, [userData]);
    
    const addPracticeSession = useCallback(async (sessionData: Omit<PracticeSession, 'id' | 'date'>) => {
        if (!userData) return;
        try {
            const newHistory = await api.addPracticeSession(sessionData);
            setUserData(d => d ? { ...d, practiceHistory: newHistory } : null);
        } catch (e) { console.error("Failed to add practice session", e); }
    }, [userData]);

    const clearHistory = useCallback(async () => {
        if (!userData) return;
        setUserData(d => d ? { ...d, practiceHistory: [] } : null);
        try { await api.clearPracticeHistory(); } 
        catch (e) { console.error("Failed to clear history", e); }
    }, [userData]);
    
    const updateSettings = useCallback(async (newSettings: Settings) => {
        if (!userData) return;
        setUserData(d => d ? { ...d, settings: newSettings } : null);
        try { await api.updateSettings(newSettings); } 
        catch (e) { console.error("Failed to update settings", e); }
    }, [userData]);

    const setTheme = (theme: ThemeName) => updateSettings({ ...userData!.settings, theme });
    const setUserName = (userName: string) => updateSettings({ ...userData!.settings, userName });

    const updateFriends = useCallback(async (newFriendIds: number[]) => {
        if (!userData) return;
        setUserData(d => d ? { ...d, friendIds: newFriendIds } : null);
        try { await api.updateFriends(newFriendIds); }
        catch (e) { console.error("Failed to update friends", e); }
    }, [userData]);

    const addFriend = (id: number) => {
        if (!userData || userData.friendIds.includes(id)) return Promise.resolve();
        return updateFriends([...userData.friendIds, id]);
    };
    
    const removeFriend = (id: number) => {
        if (!userData) return Promise.resolve();
        return updateFriends(userData.friendIds.filter(friendId => friendId !== id));
    };

    const value = {
        userData, isLoading, error, fetchNewWords,
        toggleBookmark, recordQuizResult, addPracticeSession,
        clearHistory, setTheme, setUserName, addFriend, removeFriend,
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
