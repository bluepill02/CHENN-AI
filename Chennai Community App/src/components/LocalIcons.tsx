import { motion } from 'motion/react';

// Custom Chennai-themed icons
export function AutoRickshawIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <motion.svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth={2}
      whileHover={{ scale: 1.1, rotate: 5 }}
    >
      <path d="M3 12h18M8 12V8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4" />
      <circle cx="7" cy="16" r="2" />
      <circle cx="17" cy="16" r="2" />
      <path d="M5 12h14l-2-4H7z" />
      <path d="M12 6V2" />
    </motion.svg>
  );
}

export function TempleIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <motion.svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor"
      whileHover={{ scale: 1.1 }}
      animate={{ rotate: [0, 2, -2, 0] }}
      transition={{ duration: 4, repeat: Infinity }}
    >
      <path d="M12 2L8 6h8l-4-4z" />
      <rect x="6" y="6" width="12" height="3" />
      <rect x="7" y="9" width="10" height="11" />
      <rect x="9" y="12" width="2" height="8" />
      <rect x="13" y="12" width="2" height="8" />
    </motion.svg>
  );
}

export function CoconutIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <motion.svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor"
      whileHover={{ rotate: 15, scale: 1.1 }}
    >
      <circle cx="12" cy="14" r="7" fill="currentColor" opacity="0.8" />
      <path d="M12 7c0-3 1-5 3-5s3 2 3 5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M9 7c0-3-1-5-3-5s-3 2-3 5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="10" cy="12" r="1" />
      <circle cx="14" cy="12" r="1" />
      <path d="M10 16c0 1 1 2 2 2s2-1 2-2" stroke="currentColor" strokeWidth="1" fill="none" />
    </motion.svg>
  );
}

export function TamilOmIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <motion.svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor"
      whileHover={{ scale: 1.2 }}
      animate={{ rotate: [0, 5, -5, 0] }}
      transition={{ duration: 6, repeat: Infinity }}
    >
      <path d="M6 8c0-2 2-4 4-4s4 2 4 4c0 1-1 2-2 2H8c-1 0-2-1-2-2z" />
      <path d="M12 10c2 0 4 1 4 3 0 1-1 2-2 2h-4c-1 0-2-1-2-2 0-2 2-3 4-3z" />
      <circle cx="12" cy="18" r="2" />
      <path d="M8 16c0 1 1 2 2 2h4c1 0 2-1 2-2" fill="none" stroke="currentColor" strokeWidth="1" />
    </motion.svg>
  );
}

export function MarinaBridgeIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <motion.svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth={2}
      whileHover={{ scale: 1.1 }}
    >
      <path d="M3 18h18" />
      <path d="M5 18V8c0-2 2-4 4-4h6c2 0 4 2 4 4v10" />
      <path d="M7 14h10" />
      <circle cx="8" cy="8" r="1" />
      <circle cx="16" cy="8" r="1" />
      <path d="M12 4V2" />
    </motion.svg>
  );
}

export function IdliIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <motion.svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor"
      whileHover={{ scale: 1.1, y: -2 }}
    >
      <ellipse cx="12" cy="8" rx="6" ry="2" opacity="0.6" />
      <ellipse cx="12" cy="12" rx="7" ry="2.5" opacity="0.8" />
      <ellipse cx="12" cy="16" rx="8" ry="3" />
    </motion.svg>
  );
}

export function ChennaiRainIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <motion.svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth={2}
    >
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
      <motion.path 
        d="M8 19v2m0-8v2m8 6v2m0-8v2m-4 2v2m0-8v2"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
    </motion.svg>
  );
}

export function NeighborHouseIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <motion.svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor"
      whileHover={{ scale: 1.05, y: -1 }}
    >
      <path d="M3 12l2-2m0 0l7-7 7 7m-9-7v18m9-11v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-11" 
            fill="none" stroke="currentColor" strokeWidth="2" />
      <motion.rect 
        x="10" 
        y="14" 
        width="4" 
        height="6" 
        fill="currentColor"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <rect x="9" y="9" width="2" height="2" fill="currentColor" opacity="0.7" />
      <rect x="13" y="9" width="2" height="2" fill="currentColor" opacity="0.7" />
    </motion.svg>
  );
}

export function TempleBellIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <motion.svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor"
      whileHover={{ scale: 1.1 }}
      animate={{ rotate: [0, 3, -3, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {/* Bell body */}
      <path d="M12 2C9 2 7 4 7 7v3c0 2-1 3-2 4h14c-1-1-2-2-2-4V7c0-3-2-5-5-5z" />
      {/* Bell bottom */}
      <path d="M7 14h10c0 1-1 2-2 2H9c-1 0-2-1-2-2z" />
      {/* Bell clapper */}
      <motion.circle 
        cx="12" 
        cy="18" 
        r="1.5" 
        animate={{ y: [0, 2, 0] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
      {/* Traditional temple bell top */}
      <rect x="11" y="1" width="2" height="2" rx="1" />
    </motion.svg>
  );
}

export function ChennaiLandmarkIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <motion.svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor"
      whileHover={{ scale: 1.1, rotate: 2 }}
    >
      {/* Marina Beach inspired waves */}
      <motion.path 
        d="M2 18c2-1 4-1 6 0s4 1 6 0 4-1 6 0" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
        animate={{ x: [0, 5, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.path 
        d="M2 20c2-1 4-1 6 0s4 1 6 0 4-1 6 0" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
        animate={{ x: [0, -3, 0] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      />
      {/* Chennai skyline */}
      <rect x="4" y="8" width="2" height="8" opacity="0.8" />
      <rect x="7" y="6" width="2" height="10" opacity="0.9" />
      <rect x="10" y="4" width="3" height="12" />
      <rect x="14" y="7" width="2" height="9" opacity="0.8" />
      <rect x="17" y="5" width="2" height="11" opacity="0.9" />
      {/* Traditional temple spire */}
      <path d="M11 2l1.5 2h-3L11 2z" />
    </motion.svg>
  );
}