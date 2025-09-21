import React from 'react';
import type { Rank, User, Word } from './types';

// FIX: Replaced JSX with React.createElement to be compatible with a .ts file extension.
const Medal: React.FC<{ className?: string; medalColor: string; ribbonColor: string }> = ({ className, medalColor, ribbonColor }) => (
    React.createElement('svg',
        {
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 24 24",
            className: className,
        },
        React.createElement('path', { d: "M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.5 2.8A2 2 0 0 1 6.3 2h11.4a2 2 0 0 1 1.8 1l1.7 2.1a2 2 0 0 1 .14 2.2L16.79 15", fill: ribbonColor, stroke: ribbonColor, strokeWidth: "1", strokeLinecap: "round", strokeLinejoin: "round" }),
        React.createElement('circle', { cx: "12", cy: "17", r: "5", fill: medalColor, stroke: medalColor, strokeWidth: "1" }),
        React.createElement('path', { d: "M11 12 5.12 2.2", stroke: "white", strokeOpacity: "0.5", strokeWidth: "0.5"}),
        React.createElement('path', { d: "m13 12 5.88-9.8", stroke: "white", strokeOpacity: "0.5", strokeWidth: "0.5"}),
        React.createElement('path', { d: "M8 7h8", stroke: "white", strokeOpacity: "0.5", strokeWidth: "0.5"})
    )
);

// FIX: Replaced JSX with React.createElement to be compatible with a .ts file extension.
const CopperMedal: React.FC<{ className?: string }> = ({ className }) => React.createElement(Medal, { className, medalColor: "#b87333", ribbonColor: "#a1331a" });
const BronzeMedal: React.FC<{ className?: string }> = ({ className }) => React.createElement(Medal, { className, medalColor: "#cd7f32", ribbonColor: "#365e8a" });
const SilverMedal: React.FC<{ className?: string }> = ({ className }) => React.createElement(Medal, { className, medalColor: "#c0c0c0", ribbonColor: "#365e8a" });
const GoldMedal: React.FC<{ className?: string }> = ({ className }) => React.createElement(Medal, { className, medalColor: "#ffd700", ribbonColor: "#365e8a" });
const PlatinumMedal: React.FC<{ className?: string }> = ({ className }) => React.createElement(Medal, { className, medalColor: "#e5e4e2", ribbonColor: "#5a2082" });
const DiamondMedal: React.FC<{ className?: string }> = ({ className }) => React.createElement(Medal, { className, medalColor: "#b9f2ff", ribbonColor: "#5a2082" });


export const RANKS: Rank[] = [
  { name: 'Copper', icon: CopperMedal, minWords: 50 },
  { name: 'Bronze', icon: BronzeMedal, minWords: 100 },
  { name: 'Silver', icon: SilverMedal, minWords: 150 },
  { name: 'Gold', icon: GoldMedal, minWords: 200 },
  { name: 'Platinum', icon: PlatinumMedal, minWords: 300 },
  { name: 'Diamond', icon: DiamondMedal, minWords: 500 },
];

export const INITIAL_WORDS: Word[] = [
    {
        word: 'Ephemeral',
        pronunciation: '/əˈfem(ə)rəl/',
        definition: 'Lasting for a very short time.',
        example: 'The beauty of the cherry blossoms is ephemeral.',
        synonyms: ['transitory', 'fleeting', 'momentary'],
        difficulty: 'medium',
    },
    {
        word: 'Ubiquitous',
        pronunciation: '/yo͞oˈbikwədəs/',
        definition: 'Present, appearing, or found everywhere.',
        example: 'Smartphones have become ubiquitous in modern society.',
        synonyms: ['omnipresent', 'pervasive', 'universal'],
        difficulty: 'medium',
    },
    {
        word: 'Mellifluous',
        pronunciation: '/məˈliflo͞oəs/',
        definition: 'A sound that is sweet and smooth, pleasing to hear.',
        example: 'Her mellifluous voice captivated the audience.',
        synonyms: ['euphonious', 'melodious', 'dulcet'],
        difficulty: 'hard',
    },
    {
        word: 'Serendipity',
        pronunciation: '/ˌserənˈdipədē/',
        definition: 'The occurrence and development of events by chance in a happy or beneficial way.',
        example: 'Discovering the hidden cafe was a moment of pure serendipity.',
        synonyms: ['fluke', 'chance', 'happy accident'],
        difficulty: 'hard',
    },
    {
        word: 'Benevolent',
        pronunciation: '/bəˈnevələnt/',
        definition: 'Well meaning and kindly.',
        example: 'A benevolent smile from a stranger can brighten your day.',
        synonyms: ['kind', 'charitable', 'magnanimous'],
        difficulty: 'easy',
    },
     {
        word: 'Fastidious',
        pronunciation: '/faˈstidēəs/',
        definition: 'Very attentive to and concerned about accuracy and detail.',
        example: 'He was a fastidious dresser, always impeccably attired.',
        synonyms: ['meticulous', 'scrupulous', 'punctilious'],
        difficulty: 'hard',
    },
    {
        word: 'Gregarious',
        pronunciation: '/ɡrəˈɡerēəs/',
        definition: 'Fond of company; sociable.',
        example: 'He was a popular and gregarious man.',
        synonyms: ['sociable', 'convivial', 'outgoing'],
        difficulty: 'easy',
    },
];

export const MOCK_USERS: User[] = [
  // Diamond League
  { id: 20, name: 'Zephyr', avatarUrl: 'https://picsum.photos/seed/user20/48/48', wordsLearned: 175 },

  // Platinum League
  { id: 1, name: 'Alex', avatarUrl: 'https://picsum.photos/seed/user1/48/48', wordsLearned: 142 },
  { id: 2, name: 'Lexi', avatarUrl: 'https://picsum.photos/seed/user2/48/48', wordsLearned: 121 },
  { id: 3, name: 'Chris', avatarUrl: 'https://picsum.photos/seed/user3/48/48', wordsLearned: 105 },

  // Gold League
  { id: 4, name: 'Jordan', avatarUrl: 'https://picsum.photos/seed/user4/48/48', wordsLearned: 98 },
  { id: 5, name: 'Taylor', avatarUrl: 'https://picsum.photos/seed/user5/48/48', wordsLearned: 85 },
  { id: 6, name: 'Sam', avatarUrl: 'https://picsum.photos/seed/user6/48/48', wordsLearned: 72 },
  { id: 7, name: 'Casey', avatarUrl: 'https://picsum.photos/seed/user7/48/48', wordsLearned: 63 },
  
  // Silver League
  { id: 9, name: 'Riley', avatarUrl: 'https://picsum.photos/seed/user9/48/48', wordsLearned: 55 },
  { id: 10, name: 'Dana', avatarUrl: 'https://picsum.photos/seed/user10/48/48', wordsLearned: 42 },
  { id: 12, name: 'Jessie', avatarUrl: 'https://picsum.photos/seed/user12/48/48', wordsLearned: 38 },
  
  // Bronze League
  { id: 13, name: 'Pat', avatarUrl: 'https://picsum.photos/seed/user13/48/48', wordsLearned: 26 },
  { id: 14, name: 'Robin', avatarUrl: 'https://picsum.photos/seed/user14/48/48', wordsLearned: 24 },
  { id: 15, name: 'Quinn', avatarUrl: 'https://picsum.photos/seed/user15/48/48', wordsLearned: 17 },

  // Copper League
  { id: 16, name: 'Finley', avatarUrl: 'https://picsum.photos/seed/user16/48/48', wordsLearned: 9 },
  { id: 17, name: 'Kai', avatarUrl: 'https://picsum.photos/seed/user17/48/48', wordsLearned: 3 },
];