import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface ChennaiAnimationsProps {
  children: ReactNode;
  type?: 'autorickshaw' | 'wave' | 'temple' | 'rain' | 'bounce';
  delay?: number;
}

export function ChennaiAnimations({ children, type = 'wave', delay = 0 }: ChennaiAnimationsProps) {
  const animations = {
    // Auto-rickshaw style bouncy entrance
    autorickshaw: {
      initial: { x: -100, y: 10, rotate: -5, opacity: 0 },
      animate: { 
        x: 0, 
        y: 0, 
        rotate: 0, 
        opacity: 1,
        transition: {
          type: "spring",
          damping: 10,
          stiffness: 100,
          delay
        }
      }
    },
    
    // Traditional Tamil wave gesture
    wave: {
      initial: { scale: 0.8, rotate: -10, opacity: 0 },
      animate: { 
        scale: 1, 
        rotate: 0, 
        opacity: 1,
        transition: {
          type: "spring",
          damping: 8,
          stiffness: 120,
          delay
        }
      }
    },
    
    // Temple bell sway
    temple: {
      initial: { y: -20, rotate: -15, opacity: 0 },
      animate: { 
        y: 0, 
        rotate: [0, 3, -3, 0], 
        opacity: 1,
        transition: {
          y: { type: "spring", damping: 12, stiffness: 100, delay },
          rotate: { 
            duration: 2, 
            repeat: Infinity, 
            repeatType: "reverse" as const,
            ease: "easeInOut"
          },
          opacity: { duration: 0.5, delay }
        }
      }
    },
    
    // Chennai rain drop
    rain: {
      initial: { y: -50, scale: 0, opacity: 0 },
      animate: { 
        y: 0, 
        scale: [0, 1.1, 1], 
        opacity: 1,
        transition: {
          type: "spring",
          damping: 15,
          stiffness: 200,
          delay,
          scale: { times: [0, 0.8, 1], duration: 0.6 }
        }
      }
    },
    
    // Playful bounce
    bounce: {
      initial: { scale: 0, y: 20 },
      animate: { 
        scale: 1, 
        y: 0,
        transition: {
          type: "spring",
          damping: 8,
          stiffness: 200,
          delay
        }
      },
      hover: {
        scale: 1.05,
        y: -2,
        transition: { type: "spring", damping: 15, stiffness: 300 }
      }
    }
  };

  const animation = animations[type];

  return (
    <motion.div
      initial={animation.initial}
      animate={animation.animate}
      whileHover={animation.hover}
    >
      {children}
    </motion.div>
  );
}

// Chennai-specific loading animation
export function ChennaiLoader() {
  return (
    <div className="flex items-center justify-center space-x-2">
      {['🛺', '🏛️', '🌴'].map((icon, i) => (
        <motion.span
          key={i}
          className="text-2xl"
          animate={{
            y: [0, -10, 0],
            rotate: [0, 10, 0]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut"
          }}
        >
          {icon}
        </motion.span>
      ))}
    </div>
  );
}

// Floating Tamil letters animation
export function FloatingTamilLetters() {
  const tamilLetters = ['அ', 'ஆ', 'இ', 'உ', 'எ', 'ஓ'];
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {tamilLetters.map((letter, i) => (
        <motion.div
          key={i}
          className="absolute text-red-200/30 text-4xl"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
          animate={{
            y: [0, -30, 0],
            rotate: [0, 360],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut"
          }}
        >
          {letter}
        </motion.div>
      ))}
    </div>
  );
}