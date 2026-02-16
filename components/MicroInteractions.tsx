import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomIcon } from './CustomIcons';

// --- Auto Meter Loading Component ---
interface AutoMeterLoadingProps {
    isLoading: boolean;
    message?: string;
}

export function AutoMeterLoading({ isLoading, message = "Meter Podu..." }: AutoMeterLoadingProps) {
    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <div className="bg-auto-yellow p-1 rounded-full shadow-[0_0_50px_rgba(255,215,0,0.5)]">
                        <div className="bg-black rounded-full p-8 relative overflow-hidden w-64 h-64 flex flex-col items-center justify-center border-4 border-auto-yellow">
                            {/* Meter Dial Background */}
                            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'conic-gradient(from 180deg at 50% 50%, transparent 0deg, white 360deg)' }}></div>

                            {/* Auto Icon */}
                            <motion.div
                                animate={{
                                    y: [0, -5, 0],
                                    rotate: [-2, 2, -2]
                                }}
                                transition={{
                                    duration: 0.5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="relative z-10 mb-4"
                            >
                                <CustomIcon icon="AutoRickshaw" className="w-24 h-24 text-auto-yellow" />
                            </motion.div>

                            {/* Loading Text */}
                            <motion.div
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="text-white font-display font-bold text-xl tracking-widest uppercase text-center"
                            >
                                {message}
                            </motion.div>

                            {/* Meter Needle Animation */}
                            <motion.div
                                className="absolute bottom-10 left-1/2 w-1 h-24 bg-red-500 origin-bottom rounded-full"
                                style={{ x: '-50%' }}
                                animate={{ rotate: [-45, 45, -45] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// --- Cinema Subtitle Toast Component ---
// Note: This is a custom toast component. For integration with 'sonner', 
// we might need a custom toast component passed to the toaster, or just use this for specific in-app notifications.

interface CinemaToastProps {
    isVisible: boolean;
    message: string;
    type?: 'success' | 'error' | 'info';
    onClose: () => void;
}

export function CinemaToast({ isVisible, message, type = 'info', onClose }: CinemaToastProps) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(onClose, 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[90]"
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                >
                    <div className="bg-black/90 text-yellow-400 px-6 py-3 rounded-lg border-2 border-yellow-500/50 shadow-2xl backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">
                                {type === 'success' && '🎬'}
                                {type === 'error' && '❌'}
                                {type === 'info' && 'ℹ️'}
                            </span>
                            <span className="font-display font-bold tracking-wide text-lg drop-shadow-md text-center" style={{ textShadow: '2px 2px 0px rgba(0,0,0,1)' }}>
                                {message}
                            </span>
                        </div>
                        {/* Subtitle style text shadow */}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
