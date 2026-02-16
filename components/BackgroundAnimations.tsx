import React from 'react';
import { motion } from 'framer-motion';

// Animated Kolam Pattern Background
export function AnimatedKolamBackground() {
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Rotating kolam pattern */}
      <motion.svg
        className="absolute top-0 left-0 w-96 h-96 text-orange-500/10"
        viewBox="0 0 200 200"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ filter: "blur(0.5px)" }}
      >
        <defs>
          <pattern id="kolam-dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="2" fill="currentColor" opacity="0.3" />
            <path d="M0 20 Q10 10 20 20 T40 20" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.2" />
          </pattern>
        </defs>
        <rect width="200" height="200" fill="url(#kolam-dots)" />
      </motion.svg>

      {/* Secondary rotating pattern - reverse direction */}
      <motion.svg
        className="absolute bottom-0 right-0 w-80 h-80 text-purple-500/5"
        viewBox="0 0 200 200"
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        style={{ filter: "blur(1px)" }}
      >
        <defs>
          <pattern id="kolam-lines" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M0 25 Q25 0 50 25 T100 25" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.2" />
            <circle cx="25" cy="25" r="1.5" fill="currentColor" opacity="0.15" />
          </pattern>
        </defs>
        <rect width="200" height="200" fill="url(#kolam-lines)" />
      </motion.svg>
    </motion.div>
  );
}

// Animated Gradient Mesh Background
export function GradientMeshBackground({ colors = ["from-orange-400", "to-purple-500"] }: { colors?: string[] }) {
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Large gradient blob 1 */}
      <motion.div
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{
          background: "radial-gradient(circle, #FF6B35 0%, transparent 70%)",
          top: "-50px",
          left: "-50px",
        }}
        animate={{
          x: [0, 30, 0],
          y: [0, 20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Large gradient blob 2 */}
      <motion.div
        className="absolute w-80 h-80 rounded-full blur-3xl opacity-15"
        style={{
          background: "radial-gradient(circle, #9D4EDD 0%, transparent 70%)",
          bottom: "-80px",
          right: "-50px",
        }}
        animate={{
          x: [0, -30, 0],
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* Large gradient blob 3 */}
      <motion.div
        className="absolute w-72 h-72 rounded-full blur-3xl opacity-10"
        style={{
          background: "radial-gradient(circle, #00D9FF 0%, transparent 70%)",
          top: "50%",
          right: "10%",
        }}
        animate={{
          x: [0, 20, 0],
          y: [0, -30, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
    </motion.div>
  );
}

// Floating Particle Background
export function FloatingParticlesBackground() {
  const particles = Array.from({ length: 8 }, (_, i) => i);

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {particles.map((i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 30 + 10,
            height: Math.random() * 30 + 10,
            background: `hsl(${280 + i * 20}, 100%, 60%)`,
            opacity: Math.random() * 0.2 + 0.05,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            filter: "blur(1px)",
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 50 - 25, 0],
            scale: [1, 1.2, 0.8],
            opacity: [0.1, 0.3, 0.05],
          }}
          transition={{
            duration: Math.random() * 6 + 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        />
      ))}
    </motion.div>
  );
}

// Wave Pattern Background
export function WaveBackground() {
  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0 h-40 overflow-hidden pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Wave 1 */}
      <motion.svg
        className="absolute bottom-0 w-full"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        animate={{ x: [-1440, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      >
        <path
          d="M0,64L120,74.7C240,85,480,107,720,101.3C960,96,1200,64,1320,48L1440,32L1440,120L1320,120C1200,120,960,120,720,120C480,120,240,120,120,120L0,120Z"
          fill="rgba(255, 107, 53, 0.15)"
        />
      </motion.svg>

      {/* Wave 2 */}
      <motion.svg
        className="absolute bottom-2 w-full"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        animate={{ x: [-1440, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 0.3 }}
      >
        <path
          d="M0,64L120,69.3C240,75,480,85,720,90.7C960,96,1200,96,1320,90.7L1440,85L1440,120L1320,120C1200,120,960,120,720,120C480,120,240,120,120,120L0,120Z"
          fill="rgba(157, 78, 221, 0.1)"
        />
      </motion.svg>

      {/* Wave 3 */}
      <motion.svg
        className="absolute bottom-4 w-full"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        animate={{ x: [-1440, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 0.6 }}
      >
        <path
          d="M0,96L120,101.3C240,107,480,117,720,112C960,107,1200,85,1320,74.7L1440,64L1440,120L1320,120C1200,120,960,120,720,120C480,120,240,120,120,120L0,120Z"
          fill="rgba(0, 217, 255, 0.08)"
        />
      </motion.svg>
    </motion.div>
  );
}

// Animated Backdrop Blur Background
export function BackdropBlurBackground() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 backdrop-blur-3xl" style={{ opacity: 0.5 }} />
      
      {/* Glassmorphic overlays */}
      <motion.div
        className="absolute top-0 right-0 w-96 h-96 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255, 107, 53, 0.1), transparent 70%)",
          backdropFilter: "blur(10px)",
        }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <motion.div
        className="absolute bottom-0 left-0 w-80 h-80 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(157, 78, 221, 0.1), transparent 70%)",
          backdropFilter: "blur(10px)",
        }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
    </motion.div>
  );
}

// Animated Grid Background
export function GridBackground() {
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <svg className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Animated grid lines */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 39px,
              rgba(255, 107, 53, 0.1) 39px,
              rgba(255, 107, 53, 0.1) 40px
            ),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 39px,
              rgba(255, 107, 53, 0.1) 39px,
              rgba(255, 107, 53, 0.1) 40px
            )
          `,
        }}
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

// Shimmer Background
export function ShimmerBackground() {
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)",
          backgroundSize: "200% 100%",
        }}
        animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  );
}

// Composite: Auth Screen Background
export function AuthScreenBackground() {
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-purple-600 to-blue-600" />

      {/* Animated gradient mesh */}
      <GradientMeshBackground />

      {/* Animated kolam patterns */}
      <AnimatedKolamBackground />

      {/* Overlay for depth */}
      <motion.div
        className="absolute inset-0 bg-black/20"
        animate={{ opacity: [0.2, 0.25, 0.2] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

// Composite: Community Feed Background
export function FeedScreenBackground() {
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-50 via-white to-yellow-50" />

      {/* Floating particles */}
      <FloatingParticlesBackground />

      {/* Animated kolam pattern */}
      <motion.svg
        className="absolute top-0 right-0 w-72 h-72 text-orange-500/5"
        viewBox="0 0 200 200"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        style={{ filter: "blur(1px)" }}
      >
        <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
        <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
      </motion.svg>
    </motion.div>
  );
}

// Composite: Services Screen Background
export function ServicesScreenBackground() {
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Base color */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50" />

      {/* Animated gradient mesh */}
      <GradientMeshBackground colors={["from-blue-400", "to-purple-500"]} />

      {/* Grid background */}
      <GridBackground />
    </motion.div>
  );
}

// Composite: Chat Screen Background
export function ChatScreenBackground() {
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white to-orange-50" />

      {/* Wave animation */}
      <WaveBackground />

      {/* Subtle particles */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 20% 50%, rgba(255, 107, 53, 0.05) 0%, transparent 50%)",
        }}
        animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

// Composite: Profile Screen Background
export function ProfileScreenBackground() {
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-50 to-yellow-25" />

      {/* Animated gradient blobs */}
      <GradientMeshBackground colors={["from-orange-400", "to-yellow-500"]} />

      {/* Shimmer effect */}
      <ShimmerBackground />
    </motion.div>
  );
}

// Composite: Live Updates Screen Background
export function LiveScreenBackground() {
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50" />

      {/* Animated gradient mesh */}
      <GradientMeshBackground colors={["from-cyan-400", "to-blue-500"]} />

      {/* Floating particles for "live" feeling */}
      <FloatingParticlesBackground />
    </motion.div>
  );
}

// Stagger container for animations
interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number;
}

export function StaggerContainer({ children, staggerDelay = 0.1 }: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

// Individual item for stagger effect
interface StaggerItemProps {
  children: React.ReactNode;
  index?: number;
}

export function StaggerItem({ children, index = 0 }: StaggerItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.4,
            ease: "easeOut",
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
