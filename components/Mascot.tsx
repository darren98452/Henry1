import React, { useState } from 'react';
// FIX: Import Variants type from framer-motion to correctly type animation variants.
import { motion, Variants } from 'framer-motion';

interface MascotProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

// --- Animation Variants ---

// Controls the main bounce/rotate on click
// FIX: Added Variants type to ensure compatibility with framer-motion.
const clickWrapperVariants: Variants = {
  initial: { scale: 1, rotate: 0 },
  clicked: {
    scale: [1, 1.1, 0.95, 1],
    rotate: [0, -5, 5, -5, 0],
    transition: { duration: 0.6, ease: 'easeInOut' },
  },
};

// Controls the wing flaps
// FIX: Added Variants return type to ensure compatibility with framer-motion.
const wingVariants = (origin: string): Variants => ({
  initial: { rotate: 0 },
  clicked: {
    rotate: [0, origin.includes('78%') ? 40 : -40, 0],
    transition: { duration: 0.4, ease: 'easeInOut' },
  },
});

// Controls the pupil dilation
// FIX: Added Variants type and updated deprecated 'yoyo' transition property to 'repeat' and 'repeatType'.
const pupilVariants: Variants = {
  initial: { scale: 1 },
  clicked: {
    scale: 1.2,
    transition: { duration: 0.2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' },
  },
};

// Controls the beak "chirp"
// FIX: Added Variants type for consistency and type safety.
const beakVariants: Variants = {
  initial: { y: 0 },
  clicked: {
    y: [0, 2, 0],
    transition: { duration: 0.3 },
  },
};


const Mascot: React.FC<MascotProps> = ({ message, size = 'md' }) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    if (isClicked) return; // Prevent re-triggering while animation is playing
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 600); // Must be same duration as clickWrapperVariants
  };
  
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const animationState = isClicked ? 'clicked' : 'initial';

  return (
    <div
      onClick={handleClick}
      className="flex flex-col items-center"
      style={{ cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
      aria-label="Interactive owl mascot"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick()}
    >
       {message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-base-100 p-3 rounded-lg shadow-md max-w-xs text-center mb-2"
        >
          <p className="text-sm text-slate-700">{message}</p>
          {/* Speech bubble tail */}
          <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-base-100"></div>
        </motion.div>
      )}

      <motion.div // Wrapper for click animation (bounce)
        variants={clickWrapperVariants}
        animate={animationState}
      >
        <motion.div // Wrapper for idle animation (float)
            animate={{ y: ["-4%", "4%"] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            className={sizeClasses[size]}
        >
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-label="Lexi the owl mascot">
                <title>Lexi the Owl</title>
                
                {/* Wings */}
                <motion.path
                    d="M 22,55 C 5,60 5,75 22,80 Z"
                    fill="#8b5cf6"
                    variants={wingVariants('22% 60%')}
                    animate={animationState}
                    style={{ transformOrigin: '22% 60%' }}
                />
                 <motion.path
                    d="M 78,55 C 95,60 95,75 78,80 Z"
                    fill="#8b5cf6"
                    variants={wingVariants('78% 60%')}
                    animate={animationState}
                    style={{ transformOrigin: '78% 60%' }}
                />

                {/* Body */}
                <path d="M 50,20 C 25,20 20,40 20,60 C 20,90 80,90 80,60 C 80,40 75,20 50,20 Z" fill="#a78bfa"/>
                {/* Tummy patch */}
                <path d="M 50,55 C 35,55 30,65 30,75 Q 50,85 70,75 C 70,65 65,55 50,55 Z" fill="#ede9fe"/>
                {/* Eyes background */}
                <circle cx="38" cy="45" r="15" fill="white"/>
                <circle cx="62" cy="45" r="15" fill="white"/>
                {/* Pupils */}
                <motion.circle
                    cx="40" cy="48" r="7" fill="#111827"
                    variants={pupilVariants}
                    animate={animationState}
                />
                <motion.circle
                    cx="60" cy="48" r="7" fill="#111827"
                    variants={pupilVariants}
                    animate={animationState}
                />
                {/* Beak */}
                <motion.path
                    d="M 50,50 L 55,58 L 45,58 Z"
                    fill="#f59e0b"
                    variants={beakVariants}
                    animate={animationState}
                />
                {/* Ear tufts */}
                <path d="M 30,20 Q 35,10 40,20" fill="#a78bfa" stroke="#8b5cf6" strokeWidth="2"/>
                <path d="M 70,20 Q 65,10 60,20" fill="#a78bfa" stroke="#8b5cf6" strokeWidth="2"/>
                {/* Feet */}
                <path d="M 40,88 C 35,88 35,95 40,95 C 45,95 45,88 40,88 Z" fill="#f59e0b"/>
                <path d="M 60,88 C 55,88 55,95 60,95 C 65,95 65,88 60,88 Z" fill="#f59e0b"/>
            </svg>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Mascot;
