import React from 'react';
import { motion } from 'framer-motion';

// Custom Chennai-themed SVG Icons
export const ChennaiCustomIcons = {
    // Temple icon with gopuram style
    Temple: ({ className = "w-6 h-6", color = "currentColor" }: { className?: string; color?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <motion.path
                d="M12 2L10 6H14L12 2Z"
                fill={color}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            />
            <motion.path
                d="M8 6L6 10H10L8 6Z"
                fill={color}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            />
            <motion.path
                d="M16 6L14 10H18L16 6Z"
                fill={color}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            />
            <rect x="5" y="10" width="14" height="12" fill={color} rx="1" />
            <rect x="10" y="14" width="4" height="8" fill="white" />
        </svg>
    ),

    // Auto-rickshaw icon
    AutoRickshaw: ({ className = "w-6 h-6", color = "currentColor" }: { className?: string; color?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <motion.path
                d="M4 8h16v8H4z"
                fill={color}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.4 }}
            />
            <motion.circle cx="7" cy="18" r="2" fill={color}
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <motion.circle cx="17" cy="18" r="2" fill={color}
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <path d="M8 8V6h8v2" stroke={color} strokeWidth="2" />
            <rect x="9" y="10" width="6" height="4" fill="white" opacity="0.5" />
        </svg>
    ),

    // Filter coffee icon
    FilterCoffee: ({ className = "w-6 h-6", color = "currentColor" }: { className?: string; color?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <motion.path
                d="M8 6h8v10c0 2-1.5 4-4 4s-4-2-4-4V6z"
                fill={color}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.4 }}
            />
            <ellipse cx="12" cy="6" rx="4" ry="1" fill={color} />
            <motion.path
                d="M10 2Q10 4 12 4T14 2"
                stroke={color}
                strokeWidth="1.5"
                fill="none"
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.path
                d="M12 2Q12 4 14 4"
                stroke={color}
                strokeWidth="1.5"
                fill="none"
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            />
        </svg>
    ),

    // Marina Beach waves
    BeachWaves: ({ className = "w-6 h-6", color = "currentColor" }: { className?: string; color?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <motion.path
                d="M2 12Q6 8 12 12T22 12"
                stroke={color}
                strokeWidth="2"
                fill="none"
                animate={{ x: [-24, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            <motion.path
                d="M2 16Q6 12 12 16T22 16"
                stroke={color}
                strokeWidth="2"
                fill="none"
                opacity="0.6"
                animate={{ x: [-24, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
            <motion.path
                d="M2 20Q6 16 12 20T22 20"
                stroke={color}
                strokeWidth="2"
                fill="none"
                opacity="0.3"
                animate={{ x: [-24, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            />
        </svg>
    ),

    // Kolam pattern
    KolamPattern: ({ className = "w-6 h-6", color = "currentColor" }: { className?: string; color?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="2" fill={color} />
            <circle cx="6" cy="6" r="1.5" fill={color} />
            <circle cx="18" cy="6" r="1.5" fill={color} />
            <circle cx="6" cy="18" r="1.5" fill={color} />
            <circle cx="18" cy="18" r="1.5" fill={color} />
            <motion.path
                d="M6 6Q12 12 18 6M6 18Q12 12 18 18M6 6Q12 12 6 18M18 6Q12 12 18 18"
                stroke={color}
                strokeWidth="1"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, repeat: Infinity }}
            />
        </svg>
    ),

    // Food/Idli icon
    Idli: ({ className = "w-6 h-6", color = "currentColor" }: { className?: string; color?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="8" cy="10" rx="4" ry="2" fill={color} />
            <ellipse cx="16" cy="10" rx="4" ry="2" fill={color} />
            <ellipse cx="12" cy="16" rx="4" ry="2" fill={color} />
            <motion.circle
                cx="8"
                cy="10"
                r="0.5"
                fill="white"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
            />
        </svg>
    ),

    // Community/People icon
    Community: ({ className = "w-6 h-6", color = "currentColor" }: { className?: string; color?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="8" r="3" fill={color} />
            <circle cx="6" cy="10" r="2.5" fill={color} opacity="0.7" />
            <circle cx="18" cy="10" r="2.5" fill={color} opacity="0.7" />
            <path d="M12 12c-3 0-6 2-6 5v3h12v-3c0-3-3-5-6-5z" fill={color} />
            <path d="M2 17c0-2 2-3 4-3v6H2v-3z" fill={color} opacity="0.7" />
            <path d="M22 17c0-2-2-3-4-3v6h4v-3z" fill={color} opacity="0.7" />
        </svg>
    ),

    // Location pin with Chennai style
    LocationPin: ({ className = "w-6 h-6", color = "currentColor" }: { className?: string; color?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <motion.path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                fill={color}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
            />
            <circle cx="12" cy="9" r="3" fill="white" />
            <motion.circle
                cx="12"
                cy="9"
                r="3"
                stroke={color}
                strokeWidth="2"
                fill="none"
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
            />
        </svg>
    ),

    // Bus icon
    Bus: ({ className = "w-6 h-6", color = "currentColor" }: { className?: string; color?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="5" y="4" width="14" height="14" rx="2" fill={color} />
            <rect x="7" y="6" width="10" height="6" fill="white" opacity="0.5" />
            <circle cx="8" cy="18" r="1.5" fill="white" />
            <circle cx="16" cy="18" r="1.5" fill="white" />
            <rect x="5" y="2" width="14" height="2" fill={color} />
        </svg>
    ),

    // Heart with animation
    Heart: ({ className = "w-6 h-6", color = "currentColor", filled = false }: { className?: string; color?: string; filled?: boolean }) => (
        <motion.svg
            className={className}
            viewBox="0 0 24 24"
            fill={filled ? color : "none"}
            xmlns="http://www.w3.org/2000/svg"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
        >
            <motion.path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                animate={filled ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
            />
        </motion.svg>
    ),

    // Sparkles/AI icon
    Sparkles: ({ className = "w-6 h-6", color = "currentColor" }: { className?: string; color?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <motion.path
                d="M12 2L13 8L12 14L11 8L12 2Z"
                fill={color}
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
            <motion.path
                d="M2 12L8 13L14 12L8 11L2 12Z"
                fill={color}
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
            <motion.path
                d="M18 6L19 9L18 12L17 9L18 6Z"
                fill={color}
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            <motion.path
                d="M6 18L9 19L12 18L9 17L6 18Z"
                fill={color}
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
        </svg>
    ),

    // Success checkmark
    CheckCircle: ({ className = "w-6 h-6", color = "currentColor" }: { className?: string; color?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <motion.circle
                cx="12"
                cy="12"
                r="10"
                stroke={color}
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5 }}
            />
            <motion.path
                d="M8 12l2 2 4-4"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
            />
        </svg>
    ),

    // Welcome/Namaste hands
    Namaste: ({ className = "w-6 h-6", color = "currentColor" }: { className?: string; color?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <motion.path
                d="M8 12L10 8L12 12L10 16L8 12Z"
                fill={color}
                animate={{ rotateY: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.path
                d="M16 12L14 8L12 12L14 16L16 12Z"
                fill={color}
                animate={{ rotateY: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
            />
            <circle cx="12" cy="12" r="2" fill={color} />
        </svg>
    ),

    // Celebration/Party
    Celebration: ({ className = "w-6 h-6", color = "currentColor" }: { className?: string; color?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {[...Array(8)].map((_, i) => (
                <motion.circle
                    key={i}
                    cx="12"
                    cy="12"
                    r="2"
                    fill={color}
                    initial={{ x: 0, y: 0, opacity: 1 }}
                    animate={{
                        x: Math.cos((i * Math.PI) / 4) * 8,
                        y: Math.sin((i * Math.PI) / 4) * 8,
                        opacity: [1, 0],
                    }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                />
            ))}
        </svg>
    ),
};

// Icon wrapper component for consistent styling
interface CustomIconProps {
    icon: keyof typeof ChennaiCustomIcons;
    className?: string;
    color?: string;
    filled?: boolean;
}

export function CustomIcon({ icon, className, color, filled }: CustomIconProps) {
    const IconComponent = ChennaiCustomIcons[icon];
    return <IconComponent className={className} color={color} filled={filled} />;
}

// Animated icon variants
export function AnimatedIcon({
    icon,
    className,
    color,
    animation = "bounce"
}: CustomIconProps & { animation?: "bounce" | "pulse" | "spin" | "shake" }) {
    const IconComponent = ChennaiCustomIcons[icon];

    const animations = {
        bounce: {
            y: [0, -10, 0],
            transition: { duration: 0.6, repeat: Infinity }
        },
        pulse: {
            scale: [1, 1.2, 1],
            transition: { duration: 1, repeat: Infinity }
        },
        spin: {
            rotate: 360,
            transition: { duration: 2, repeat: Infinity, ease: "linear" as any }
        },
        shake: {
            x: [0, -5, 5, -5, 5, 0],
            transition: { duration: 0.5, repeat: Infinity, repeatDelay: 2 }
        }
    };

    return (
        <motion.div animate={animations[animation]}>
            <IconComponent className={className} color={color} />
        </motion.div>
    );
}
