import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Share2, Loader2 } from 'lucide-react';
import { CustomIcon, ChennaiCustomIcons } from './CustomIcons';

interface PostCardProps {
    children: React.ReactNode;
    delay?: number;
}

export function AnimatedPostCard({ children, delay = 0 }: PostCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, delay }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
            {children}
        </motion.div>
    );
}

interface LikeButtonProps {
    isLiked: boolean;
    count: number;
    onClick: () => void;
    label?: string;
}

export function AnimatedLikeButton({ isLiked, count, onClick, label }: LikeButtonProps) {
    const [isAnimating, setIsAnimating] = React.useState(false);

    const handleClick = () => {
        setIsAnimating(true);
        onClick();
        setTimeout(() => setIsAnimating(false), 600);
    };

    return (
        <motion.button
            className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors relative"
            onClick={handleClick}
            whileTap={{ scale: 0.9 }}
        >
            <motion.div
                animate={isAnimating ? {
                    scale: [1, 1.3, 1],
                } : {}}
                transition={{ duration: 0.3 }}
            >
                <CustomIcon
                    icon="Heart"
                    className={`w-5 h-5 ${isLiked ? 'text-red-500' : ''}`}
                    filled={isLiked}
                />
            </motion.div>

            {isAnimating && (
                <>
                    <motion.div
                        className="absolute"
                        initial={{ scale: 1, opacity: 1 }}
                        animate={{ scale: 2, opacity: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <CustomIcon icon="Heart" className="w-5 h-5 text-red-500" filled={true} />
                    </motion.div>
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute"
                            initial={{
                                x: 0,
                                y: 0,
                                opacity: 1,
                                scale: 0.5,
                            }}
                            animate={{
                                x: Math.cos((i * Math.PI) / 3) * 30,
                                y: Math.sin((i * Math.PI) / 3) * 30,
                                opacity: 0,
                                scale: 0,
                            }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="text-red-500 text-xs">❤️</span>
                        </motion.div>
                    ))}
                </>
            )}

            <motion.span
                className="text-sm font-medium"
                key={count}
                initial={{ scale: 1.2, color: '#ef4444' }}
                animate={{ scale: 1, color: isLiked ? '#ef4444' : '#6b7280' }}
                transition={{ duration: 0.3 }}
            >
                {label ? label : count}
            </motion.span>
        </motion.button>
    );
}

interface FloatingActionButtonProps {
    onClick: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
    return (
        <motion.button
            className="fixed bottom-24 right-6 w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-2xl flex items-center justify-center z-40"
            onClick={onClick}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
            <motion.div
                animate={{
                    rotate: 360,
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                }}
            >
                <CustomIcon icon="Sparkles" className="w-8 h-8 text-white" />
            </motion.div>

            {/* Pulsing ring */}
            <motion.div
                className="absolute inset-0 rounded-full border-4 border-orange-400"
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 0, 0.5],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                }}
            />
        </motion.button>
    );
}

interface PullToRefreshProps {
    onRefresh: () => Promise<void>;
    children: React.ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
    const [isPulling, setIsPulling] = React.useState(false);
    const [pullDistance, setPullDistance] = React.useState(0);
    const [isRefreshing, setIsRefreshing] = React.useState(false);
    const startY = React.useRef(0);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (containerRef.current?.scrollTop === 0) {
            startY.current = e.touches[0].clientY;
            setIsPulling(true);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isPulling || containerRef.current?.scrollTop !== 0) return;

        const currentY = e.touches[0].clientY;
        const distance = Math.max(0, currentY - startY.current);
        setPullDistance(Math.min(distance, 100));
    };

    const handleTouchEnd = async () => {
        if (pullDistance > 60 && !isRefreshing) {
            setIsRefreshing(true);
            await onRefresh();
            setIsRefreshing(false);
        }
        setIsPulling(false);
        setPullDistance(0);
    };

    return (
        <div
            ref={containerRef}
            className="relative overflow-y-auto"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Pull indicator */}
            <motion.div
                className="absolute top-0 left-0 right-0 flex items-center justify-center"
                animate={{
                    height: isPulling || isRefreshing ? pullDistance : 0,
                    opacity: isPulling || isRefreshing ? 1 : 0,
                }}
                transition={{ duration: 0.2 }}
            >
                <motion.div
                    animate={{
                        rotate: isRefreshing ? 360 : pullDistance * 3.6,
                    }}
                    transition={{
                        duration: isRefreshing ? 1 : 0,
                        repeat: isRefreshing ? Infinity : 0,
                        ease: "linear",
                    }}
                >
                    {/* Using AutoRickshaw for a fun loading indicator */}
                    <CustomIcon icon="AutoRickshaw" className="w-8 h-8 text-orange-500" />
                </motion.div>
            </motion.div>

            {/* Content */}
            <motion.div
                animate={{
                    y: isPulling || isRefreshing ? pullDistance : 0,
                }}
                transition={{ duration: 0.2 }}
            >
                {children}
            </motion.div>
        </div>
    );
}

interface StoryHighlightProps {
    image?: string;
    icon?: keyof typeof ChennaiCustomIcons;
    title: string;
    isNew?: boolean;
    onClick: () => void;
}

export function StoryHighlight({ image, icon, title, isNew, onClick }: StoryHighlightProps) {
    return (
        <motion.button
            className="flex flex-col items-center gap-2 min-w-[80px]"
            onClick={onClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <motion.div
                className="relative"
                whileHover={{ rotate: 5 }}
            >
                <div className={`w-16 h-16 rounded-full p-[3px] ${isNew
                    ? 'bg-gradient-to-tr from-orange-500 via-red-500 to-pink-500'
                    : 'bg-gray-300'
                    }`}>
                    <div className="w-full h-full rounded-full bg-white p-[2px] flex items-center justify-center overflow-hidden">
                        {icon ? (
                            <div className="w-full h-full bg-orange-50 flex items-center justify-center">
                                <CustomIcon icon={icon} className="w-8 h-8 text-orange-600" />
                            </div>
                        ) : (
                            <img
                                src={image}
                                alt={title}
                                className="w-full h-full rounded-full object-cover"
                            />
                        )}
                    </div>
                </div>

                {isNew && (
                    <motion.div
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                    >
                        <CustomIcon icon="Sparkles" className="w-3 h-3 text-white" />
                    </motion.div>
                )}
            </motion.div>

            <span className="text-xs text-gray-700 font-medium text-center line-clamp-2 w-full">
                {title}
            </span>
        </motion.button>
    );
}

interface CommentButtonProps {
    count: number;
    onClick: () => void;
}

export function AnimatedCommentButton({ count, onClick }: CommentButtonProps) {
    return (
        <motion.button
            className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors"
            onClick={onClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{count}</span>
        </motion.button>
    );
}

interface ShareButtonProps {
    onClick: () => void;
}

export function AnimatedShareButton({ onClick }: ShareButtonProps) {
    const [isSharing, setIsSharing] = React.useState(false);

    const handleClick = () => {
        setIsSharing(true);
        onClick();
        setTimeout(() => setIsSharing(false), 1000);
    };

    return (
        <motion.button
            className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors relative"
            onClick={handleClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <motion.div
                animate={isSharing ? {
                    rotate: [0, -10, 10, -10, 10, 0],
                } : {}}
                transition={{ duration: 0.5 }}
            >
                <Share2 className="w-5 h-5" />
            </motion.div>

            {isSharing && (
                <>
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute"
                            initial={{
                                x: 0,
                                y: 0,
                                opacity: 1,
                                scale: 0.5,
                            }}
                            animate={{
                                x: (i - 1) * 20,
                                y: -20,
                                opacity: 0,
                                scale: 0,
                            }}
                            transition={{ duration: 0.6, delay: i * 0.1 }}
                        >
                            <Share2 className="w-4 h-4 text-green-500" />
                        </motion.div>
                    ))}
                </>
            )}
        </motion.button>
    );
}

export function PostImageGallery({ images }: { images: string[] }) {
    const [selectedImage, setSelectedImage] = React.useState(0);

    if (images.length === 0) return null;

    if (images.length === 1) {
        return (
            <motion.div
                className="mb-3 rounded-xl overflow-hidden"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
            >
                <img
                    src={images[0]}
                    alt="Post content"
                    className="w-full h-64 object-cover"
                />
            </motion.div>
        );
    }

    return (
        <div className="mb-3">
            <motion.div
                className="rounded-xl overflow-hidden mb-2"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
            >
                <img
                    src={images[selectedImage]}
                    alt="Post content"
                    className="w-full h-64 object-cover"
                />
            </motion.div>

            <div className="flex gap-2 overflow-x-auto">
                {images.map((img, index) => (
                    <motion.button
                        key={index}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${selectedImage === index ? 'border-orange-500' : 'border-gray-200'
                            }`}
                        onClick={() => setSelectedImage(index)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <img
                            src={img}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
