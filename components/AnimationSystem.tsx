import { motion, Variants, AnimationControls } from 'framer-motion';
import React from 'react';

// ==========================
// ENTRANCE ANIMATION VARIANTS
// ==========================

export const entranceVariants = {
  // Fade in from top
  fadeInUp: {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: "easeOut",
      },
    }),
  } as Variants,

  // Fade in from bottom
  fadeInDown: {
    hidden: { opacity: 0, y: -20 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: "easeOut",
      },
    }),
  } as Variants,

  // Fade in from left
  fadeInLeft: {
    hidden: { opacity: 0, x: -20 },
    visible: (i = 1) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: "easeOut",
      },
    }),
  } as Variants,

  // Fade in from right
  fadeInRight: {
    hidden: { opacity: 0, x: 20 },
    visible: (i = 1) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: "easeOut",
      },
    }),
  } as Variants,

  // Scale and fade in
  scaleIn: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (i = 1) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: "easeOut",
      },
    }),
  } as Variants,

  // Bounce in
  bounceIn: {
    hidden: { opacity: 0, scale: 0.3 },
    visible: (i = 1) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "backOut",
      },
    }),
  } as Variants,

  // Rotate in
  rotateIn: {
    hidden: { opacity: 0, rotate: -10, scale: 0.9 },
    visible: (i = 1) => ({
      opacity: 1,
      rotate: 0,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: "easeOut",
      },
    }),
  } as Variants,

  // Slide in from left
  slideInLeft: {
    hidden: { opacity: 0, x: -100 },
    visible: (i = 1) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  } as Variants,

  // Slide in from right
  slideInRight: {
    hidden: { opacity: 0, x: 100 },
    visible: (i = 1) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  } as Variants,
};

// ==========================
// TRANSITION ANIMATION VARIANTS
// ==========================

export const transitionVariants = {
  // Page transition - fade
  pageTransitionFade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  } as Variants,

  // Page transition - scale
  pageTransitionScale: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } },
  } as Variants,

  // Page transition - slide up
  pageTransitionUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  } as Variants,

  // Page transition - slide down
  pageTransitionDown: {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, y: 20, transition: { duration: 0.3 } },
  } as Variants,

  // Modal entrance
  modalEnter: {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } },
  } as Variants,

  // Drawer from left
  drawerFromLeft: {
    hidden: { opacity: 0, x: -300 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, x: -300, transition: { duration: 0.3 } },
  } as Variants,

  // Drawer from right
  drawerFromRight: {
    hidden: { opacity: 0, x: 300 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, x: 300, transition: { duration: 0.3 } },
  } as Variants,
};

// ==========================
// MICRO-INTERACTION VARIANTS
// ==========================

export const microInteractionVariants = {
  // Button hover
  buttonHover: {
    rest: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95, transition: { duration: 0.1 } },
  } as Variants,

  // Button with glow
  buttonGlow: {
    rest: {
      boxShadow: "0 0 0px rgba(255, 107, 53, 0.3)",
      transition: { duration: 0.2 },
    },
    hover: {
      boxShadow: "0 0 15px rgba(255, 107, 53, 0.6)",
      scale: 1.05,
      transition: { duration: 0.2 },
    },
  } as Variants,

  // Icon pulse
  iconPulse: {
    rest: { scale: 1 },
    pulse: {
      scale: [1, 1.1, 1],
      transition: { duration: 1.5, repeat: Infinity },
    },
  } as Variants,

  // Icon bounce
  iconBounce: {
    rest: { y: 0 },
    bounce: {
      y: [-2, 2, -2],
      transition: { duration: 1.5, repeat: Infinity },
    },
  } as Variants,

  // Card hover lift
  cardHoverLift: {
    rest: {
      y: 0,
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    },
    hover: {
      y: -8,
      boxShadow: "0 20px 25px rgba(0, 0, 0, 0.15)",
      transition: { duration: 0.3 },
    },
  } as Variants,

  // Input focus glow
  inputFocus: {
    rest: { borderColor: "rgba(255, 107, 53, 0.2)" },
    focus: {
      borderColor: "rgba(255, 107, 53, 0.8)",
      boxShadow: "0 0 0 3px rgba(255, 107, 53, 0.1)",
      transition: { duration: 0.2 },
    },
  } as Variants,

  // Badge pulse
  badgePulse: {
    rest: { scale: 1 },
    pulse: {
      scale: [1, 1.15, 1],
      transition: { duration: 1, repeat: Infinity },
    },
  } as Variants,

  // Like button animation
  likeAnimation: {
    rest: { scale: 1, rotate: 0 },
    active: {
      scale: [1, 1.3, 1],
      rotate: [0, -10, 10, 0],
      transition: { duration: 0.4 },
    },
  } as Variants,

  // Tooltip fade
  tooltipFade: {
    hidden: { opacity: 0, y: 5 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  } as Variants,

  // Loading spinner
  loadingSpinner: {
    spin: {
      rotate: 360,
      transition: { duration: 1.5, repeat: Infinity, ease: "linear" },
    },
  } as Variants,

  // Shimmer loading
  shimmerLoading: {
    loading: {
      backgroundPosition: ["200% 0", "-200% 0"],
      transition: { duration: 2, repeat: Infinity, ease: "linear" },
    },
  } as Variants,
};

// ==========================
// CONTAINER VARIANTS (for stagger effects)
// ==========================

export const containerVariants = {
  // Stagger children with fade in
  staggerFadeIn: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  } as Variants,

  // Stagger children with slide up
  staggerSlideUp: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  } as Variants,

  // Stagger children with scale
  staggerScale: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15,
      },
    },
  } as Variants,
};

// ==========================
// ANIMATION TIMING PRESETS
// ==========================

export const timingPresets = {
  instant: { duration: 0.1 },
  fast: { duration: 0.2 },
  normal: { duration: 0.3 },
  slow: { duration: 0.5 },
  slower: { duration: 0.8 },
  slowest: { duration: 1.2 },
};

// ==========================
// EASING PRESETS
// ==========================

export const easingPresets = {
  easeInOut: "easeInOut",
  easeOut: "easeOut",
  easeIn: "easeIn",
  circInOut: "circInOut",
  backOut: "backOut",
  anticipate: "anticipate",
};

// ==========================
// UTILITY COMPONENTS
// ==========================

interface AnimationWrapperProps {
  variant: Variants;
  children: React.ReactNode;
  className?: string;
  initial?: string | boolean;
  animate?: string | boolean;
  exit?: string | boolean;
  whileHover?: string;
  whileTap?: string;
  custom?: any;
}

export function AnimationWrapper({
  variant,
  children,
  className,
  initial = "hidden",
  animate = "visible",
  exit,
  whileHover,
  whileTap,
  custom,
}: AnimationWrapperProps) {
  return (
    <motion.div
      variants={variant}
      initial={initial}
      animate={animate}
      exit={exit}
      whileHover={whileHover ? variant[whileHover] : undefined}
      whileTap={whileTap ? variant[whileTap] : undefined}
      custom={custom}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggeredContainerProps {
  children: React.ReactNode;
  variant?: Variants;
  className?: string;
  staggerDelay?: number;
}

export function StaggeredContainer({
  children,
  variant = containerVariants.staggerFadeIn,
  className,
  staggerDelay = 0.1,
}: StaggeredContainerProps) {
  const customVariant = {
    ...variant,
    visible: {
      ...(typeof variant.visible === "object" ? variant.visible : {}),
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      variants={customVariant}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggeredItemProps {
  children: React.ReactNode;
  variant?: Variants;
  className?: string;
}

export function StaggeredItem({
  children,
  variant = entranceVariants.fadeInUp,
  className,
}: StaggeredItemProps) {
  return (
    <motion.div variants={variant} className={className}>
      {children}
    </motion.div>
  );
}

interface HoverCardProps {
  children: React.ReactNode;
  className?: string;
}

export function HoverCard({ children, className }: HoverCardProps) {
  return (
    <motion.div
      variants={microInteractionVariants.cardHoverLift}
      initial="rest"
      whileHover="hover"
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "default" | "glow";
}

export function AnimatedButton({
  children,
  variant = "default",
  className = "",
  ...props
}: AnimatedButtonProps) {
  const buttonVariant =
    variant === "glow"
      ? microInteractionVariants.buttonGlow
      : microInteractionVariants.buttonHover;

  return (
    <motion.button
      variants={buttonVariant}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
}

interface PageTransitionProps {
  children: React.ReactNode;
  variant?: "fade" | "scale" | "up" | "down";
}

export function PageTransition({
  children,
  variant = "scale",
}: PageTransitionProps) {
  const variantMap = {
    fade: transitionVariants.pageTransitionFade,
    scale: transitionVariants.pageTransitionScale,
    up: transitionVariants.pageTransitionUp,
    down: transitionVariants.pageTransitionDown,
  };

  return (
    <motion.div
      variants={variantMap[variant]}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}

interface SkeletonLoaderProps {
  width?: string;
  height?: string;
  className?: string;
  count?: number;
}

export function SkeletonLoader({
  width = "w-full",
  height = "h-4",
  className = "",
  count = 1,
}: SkeletonLoaderProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={`${width} ${height} bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-2 ${className}`}
          animate={{
            backgroundPosition: ["200% 0", "-200% 0"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            backgroundSize: "200% 100%",
          }}
        />
      ))}
    </>
  );
}

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

export function AnimatedNumber({
  value,
  duration = 2,
  prefix = "",
  suffix = "",
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    const steps = 60;
    const stepValue = value / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      setDisplayValue(Math.min(Math.round(stepValue * currentStep), value));

      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, (duration * 1000) / steps);

    return () => clearInterval(interval);
  }, [value, duration]);

  return (
    <span>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}
