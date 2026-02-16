import React from 'react';
import { motion } from 'framer-motion';

interface FloatingElementProps {
    children: React.ReactNode;
    delay?: number;
    duration?: number;
    yOffset?: number;
    xOffset?: number;
}

export function FloatingElement({
    children,
    delay = 0,
    duration = 3,
    yOffset = 20,
    xOffset = 10
}: FloatingElementProps) {
    return (
        <motion.div
            animate={{
                y: [0, -yOffset, 0],
                x: [0, xOffset, 0],
            }}
            transition={{
                duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay,
            }}
        >
            {children}
        </motion.div>
    );
}

interface AnimatedInputProps {
    children: React.ReactNode;
    delay?: number;
}

export function AnimatedInput({ children, delay = 0 }: AnimatedInputProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
        >
            {children}
        </motion.div>
    );
}

interface RippleButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
    type?: 'button' | 'submit';
}

export function RippleButton({
    children,
    onClick,
    className = '',
    disabled = false,
    type = 'button'
}: RippleButtonProps) {
    const [ripples, setRipples] = React.useState<Array<{ x: number; y: number; id: number }>>([]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const newRipple = { x, y, id: Date.now() };
        setRipples([...ripples, newRipple]);

        setTimeout(() => {
            setRipples(ripples => ripples.filter(r => r.id !== newRipple.id));
        }, 600);

        onClick?.();
    };

    return (
        <motion.button
            type={type}
            onClick={handleClick}
            disabled={disabled}
            className={`relative overflow-hidden ${className}`}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            whileHover={{ scale: disabled ? 1 : 1.02 }}
        >
            {children}
            {ripples.map(ripple => (
                <motion.span
                    key={ripple.id}
                    className="absolute bg-white/30 rounded-full pointer-events-none"
                    style={{
                        left: ripple.x,
                        top: ripple.y,
                        width: 0,
                        height: 0,
                    }}
                    initial={{ width: 0, height: 0, opacity: 1 }}
                    animate={{
                        width: 400,
                        height: 400,
                        opacity: 0,
                        x: -200,
                        y: -200,
                    }}
                    transition={{ duration: 0.6 }}
                />
            ))}
        </motion.button>
    );
}

export function PageTransition({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
        >
            {children}
        </motion.div>
    );
}

export function SuccessCheckmark() {
    return (
        <motion.svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
        >
            <motion.circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3 }}
            />
            <motion.path
                d="M8 12l2 2 4-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            />
        </motion.svg>
    );
}

export function KolamPattern() {
    return (
        <svg
            className="absolute inset-0 w-full h-full opacity-5 pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <pattern id="kolam" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                    <circle cx="10" cy="10" r="2" fill="white" />
                    <circle cx="50" cy="10" r="2" fill="white" />
                    <circle cx="90" cy="10" r="2" fill="white" />
                    <circle cx="10" cy="50" r="2" fill="white" />
                    <circle cx="50" cy="50" r="2" fill="white" />
                    <circle cx="90" cy="50" r="2" fill="white" />
                    <circle cx="10" cy="90" r="2" fill="white" />
                    <circle cx="50" cy="90" r="2" fill="white" />
                    <circle cx="90" cy="90" r="2" fill="white" />
                    <path
                        d="M 10 10 Q 30 30 50 10 T 90 10 M 10 50 Q 30 70 50 50 T 90 50 M 10 90 Q 30 110 50 90 T 90 90"
                        stroke="white"
                        strokeWidth="1"
                        fill="none"
                    />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#kolam)" />
        </svg>
    );
}

export function WaveAnimation() {
    return (
        <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden pointer-events-none">
            <motion.svg
                className="absolute bottom-0 w-full"
                viewBox="0 0 1440 120"
                xmlns="http://www.w3.org/2000/svg"
                initial={{ x: 0 }}
                animate={{ x: [-1440, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
                <path
                    d="M0,64 C240,96 480,32 720,64 C960,96 1200,32 1440,64 L1440,120 L0,120 Z"
                    fill="rgba(255, 255, 255, 0.1)"
                />
            </motion.svg>
            <motion.svg
                className="absolute bottom-0 w-full"
                viewBox="0 0 1440 120"
                xmlns="http://www.w3.org/2000/svg"
                initial={{ x: 0 }}
                animate={{ x: [-1440, 0] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear", delay: 0.5 }}
            >
                <path
                    d="M0,80 C240,48 480,112 720,80 C960,48 1200,112 1440,80 L1440,120 L0,120 Z"
                    fill="rgba(255, 255, 255, 0.05)"
                />
            </motion.svg>
        </div>
    );
}
