import { useState, useEffect, useCallback } from 'react';

const SOCIAL_STORAGE_KEY = 'vocab-ai-trainer-social';

interface SocialData {
    friendIds: number[];
}

export const useSocial = () => {
    const [friendIds, setFriendIds] = useState<Set<number>>(() => {
        try {
            const storedData = localStorage.getItem(SOCIAL_STORAGE_KEY);
            if (storedData) {
                const parsed: SocialData = JSON.parse(storedData);
                if (Array.isArray(parsed.friendIds)) {
                    return new Set(parsed.friendIds);
                }
            }
        } catch (error) {
            console.error("Failed to parse social data from localStorage", error);
        }
        // Start with a few default friends to showcase the feature
        return new Set([2, 5, 9]);
    });

    useEffect(() => {
        const dataToStore: SocialData = {
            friendIds: Array.from(friendIds),
        };
        localStorage.setItem(SOCIAL_STORAGE_KEY, JSON.stringify(dataToStore));
    }, [friendIds]);

    const addFriend = useCallback((id: number) => {
        setFriendIds(prev => {
            const newSet = new Set(prev);
            newSet.add(id);
            return newSet;
        });
    }, []);
    
    const removeFriend = useCallback((id: number) => {
        setFriendIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
        });
    }, []);
    
    const isFriend = useCallback((id: number) => {
        return friendIds.has(id);
    }, [friendIds]);

    return {
        friendIds,
        addFriend,
        removeFriend,
        isFriend,
    };
};

export type UseSocialReturn = ReturnType<typeof useSocial>;
