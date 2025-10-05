import { useCallback, useContext } from 'react';
import { UserContext } from '../contexts/UserContext';

export const useSocial = () => {
    const { userData, addFriend, removeFriend } = useContext(UserContext);

    const friendIds = userData?.friendIds || [];
    
    const isFriend = useCallback((id: number) => {
        return friendIds.includes(id);
    }, [friendIds]);

    return {
        friendIds: new Set(friendIds),
        addFriend,
        removeFriend,
        isFriend,
    };
};

export type UseSocialReturn = ReturnType<typeof useSocial>;
