import React from 'react';
import { motion } from 'framer-motion';

// Premium SVG Icon Components with detailed designs
export const PremiumIcons = {
  // FOOD & DINING CATEGORY
  Food: ({ className = "w-6 h-6", color = "currentColor", animated = true }: { className?: string; color?: string; animated?: boolean }) => (
    <motion.svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={animated ? { y: [0, -2, 0] } : {}}
      transition={animated ? { duration: 2, repeat: Infinity } : {}}
    >
      {/* Steamer basket */}
      <g>
        {/* Bamboo layers */}
        <ellipse cx="12" cy="5" rx="8" ry="2" fill={color} opacity="0.3" />
        <path d="M4 5V4H20V5" stroke={color} strokeWidth="1" />
        <ellipse cx="12" cy="5.5" rx="8" ry="2" fill={color} opacity="0.6" />
        
        {/* Idli pieces */}
        <motion.circle
          cx="8" cy="10" r="2.5" fill={color}
          animate={animated ? { y: [0, 1, 0] } : {}}
          transition={animated ? { duration: 1.5, repeat: Infinity, delay: 0 } : {}}
        />
        <motion.circle
          cx="12" cy="10" r="2.5" fill={color}
          animate={animated ? { y: [0, 1, 0] } : {}}
          transition={animated ? { duration: 1.5, repeat: Infinity, delay: 0.1 } : {}}
        />
        <motion.circle
          cx="16" cy="10" r="2.5" fill={color}
          animate={animated ? { y: [0, 1, 0] } : {}}
          transition={animated ? { duration: 1.5, repeat: Infinity, delay: 0.2 } : {}}
        />
        
        {/* Chutney cup */}
        <path d="M10 14H14V18C14 19 13.5 20 12 20C10.5 20 10 19 10 18V14Z" fill={color} opacity="0.7" />
        <ellipse cx="12" cy="14" rx="2" ry="1" fill={color} />
      </g>
    </motion.svg>
  ),

  // AUTO RICKSHAW
  Auto: ({ className = "w-6 h-6", color = "currentColor", animated = true }: { className?: string; color?: string; animated?: boolean }) => (
    <motion.svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={animated ? { x: [0, 2, 0] } : {}}
      transition={animated ? { duration: 2, repeat: Infinity } : {}}
    >
      {/* Body */}
      <path d="M3 10H21V14H20V18H18V14H6V18H4V14H3V10Z" fill={color} />
      
      {/* Cabin roof */}
      <path d="M5 6V10H19V6C19 5 18.5 4 17 4H7C5.5 4 5 5 5 6Z" fill={color} opacity="0.8" />
      
      {/* Windows */}
      <rect x="6" y="7" width="3" height="2" fill="white" opacity="0.4" />
      <rect x="15" y="7" width="3" height="2" fill="white" opacity="0.4" />
      
      {/* Front wheels - animated rotation */}
      <motion.circle
        cx="6" cy="18" r="1.5" fill={color}
        animate={animated ? { rotate: 360 } : {}}
        transition={animated ? { duration: 2, repeat: Infinity, ease: "linear" } : {}}
      />
      <circle cx="6" cy="18" r="1" fill="white" opacity="0.5" />
      
      {/* Back wheel */}
      <motion.circle
        cx="18" cy="18" r="1.5" fill={color}
        animate={animated ? { rotate: 360 } : {}}
        transition={animated ? { duration: 2, repeat: Infinity, ease: "linear" } : {}}
      />
      <circle cx="18" cy="18" r="1" fill="white" opacity="0.5" />
      
      {/* Decorative bumper */}
      <rect x="3" y="13.5" width="18" height="0.5" fill={color} opacity="0.5" />
    </motion.svg>
  ),

  // MEDICAL / HEALTHCARE
  Medical: ({ className = "w-6 h-6", color = "currentColor", animated = true }: { className?: string; color?: string; animated?: boolean }) => (
    <motion.svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Stethoscope */}
      <g>
        {/* Earpieces */}
        <motion.circle cx="8" cy="4" r="1" fill={color} animate={animated ? { scale: [1, 1.2, 1] } : {}} transition={animated ? { duration: 1.5, repeat: Infinity } : {}} />
        <motion.circle cx="16" cy="4" r="1" fill={color} animate={animated ? { scale: [1, 1.2, 1] } : {}} transition={animated ? { duration: 1.5, repeat: Infinity, delay: 0.1 } : {}} />
        
        {/* Curved tubes */}
        <path d="M8 5Q8 10 12 10Q16 10 16 5" stroke={color} strokeWidth="1.5" fill="none" />
        
        {/* Diaphragm */}
        <circle cx="12" cy="18" r="4" fill={color} opacity="0.7" />
        <motion.circle
          cx="12" cy="18" r="3.5" fill="none" stroke={color} strokeWidth="1"
          animate={animated ? { r: [3.5, 4.5, 3.5] } : {}}
          transition={animated ? { duration: 1.5, repeat: Infinity } : {}}
        />
      </g>
    </motion.svg>
  ),

  // EDUCATION / TUITION
  Education: ({ className = "w-6 h-6", color = "currentColor", animated = true }: { className?: string; color?: string; animated?: boolean }) => (
    <motion.svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Mortarboard cap */}
      <motion.path
        d="M3 8L12 4L21 8V9L12 5L3 9V8Z"
        fill={color}
        animate={animated ? { y: [0, -1, 0] } : {}}
        transition={animated ? { duration: 2, repeat: Infinity } : {}}
      />
      
      {/* Cap base */}
      <rect x="10" y="9" width="4" height="2" fill={color} opacity="0.8" />
      
      {/* Tassel */}
      <line x1="12" y1="11" x2="12" y2="15" stroke={color} strokeWidth="1" />
      <motion.circle
        cx="12" cy="16" r="1" fill={color}
        animate={animated ? { y: [0, 1, 0] } : {}}
        transition={animated ? { duration: 1.5, repeat: Infinity } : {}}
      />
      
      {/* Books */}
      <rect x="5" y="13" width="4" height="3" rx="0.5" fill={color} opacity="0.7" />
      <rect x="10" y="14" width="4" height="2" rx="0.5" fill={color} opacity="0.5" />
      <rect x="15" y="15" width="4" height="1" rx="0.5" fill={color} opacity="0.3" />
      
      {/* Book lines */}
      <line x1="6" y1="14" x2="8" y2="14" stroke="white" strokeWidth="0.5" opacity="0.5" />
      <line x1="6" y1="15" x2="8" y2="15" stroke="white" strokeWidth="0.5" opacity="0.5" />
    </motion.svg>
  ),

  // REPAIR / SERVICES
  Repair: ({ className = "w-6 h-6", color = "currentColor", animated = true }: { className?: string; color?: string; animated?: boolean }) => (
    <motion.svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Wrench */}
      <g>
        {/* Handle */}
        <motion.path
          d="M3 12C3 9 5 7 8 7C10 7 11.5 8.5 11.5 10"
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          animate={animated ? { rotate: [-5, 5, -5] } : {}}
          transition={animated ? { duration: 2, repeat: Infinity } : {}}
          style={{ originX: "8px", originY: "7px" }}
        />
        
        {/* Wrench head */}
        <path d="M11 10L15 14L16 13L12 9" fill={color} opacity="0.8" />
        
        {/* Bolt hole */}
        <circle cx="13.5" cy="11.5" r="1" fill="white" opacity="0.5" />
        
        {/* Screwdriver */}
        <line x1="16" y1="4" x2="16" y2="14" stroke={color} strokeWidth="1.5" opacity="0.6" />
        <polygon points="15.5,4 16.5,4 16,2.5" fill={color} opacity="0.6" />
      </g>
    </motion.svg>
  ),

  // SHOPS / GROCERY
  Shop: ({ className = "w-6 h-6", color = "currentColor", animated = true }: { className?: string; color?: string; animated?: boolean }) => (
    <motion.svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Building facade */}
      <rect x="3" y="6" width="18" height="15" rx="1" fill={color} opacity="0.8" />
      
      {/* Roof */}
      <path d="M3 6L12 2L21 6" stroke={color} strokeWidth="1" fill="none" />
      <path d="M3 6L12 2L21 6" fill={color} opacity="0.3" />
      
      {/* Door */}
      <rect x="9" y="13" width="6" height="8" rx="1" fill={color} opacity="0.5" />
      
      {/* Doorknob */}
      <motion.circle
        cx="14" cy="17" r="0.5" fill="white" opacity="0.8"
        animate={animated ? { x: [0, 0.3, 0] } : {}}
        transition={animated ? { duration: 1.5, repeat: Infinity } : {}}
      />
      
      {/* Windows */}
      <rect x="5" y="8" width="2.5" height="2.5" fill={color} opacity="0.3" />
      <rect x="16.5" y="8" width="2.5" height="2.5" fill={color} opacity="0.3" />
      <rect x="5" y="11.5" width="2.5" height="2.5" fill={color} opacity="0.3" />
      <rect x="16.5" y="11.5" width="2.5" height="2.5" fill={color} opacity="0.3" />
      
      {/* Shop sign */}
      <motion.rect
        x="8" y="4" width="8" height="1" rx="0.5" fill={color}
        animate={animated ? { y: [4, 3.8, 4] } : {}}
        transition={animated ? { duration: 2, repeat: Infinity } : {}}
      />
    </motion.svg>
  ),

  // CINEMA / ENTERTAINMENT
  Cinema: ({ className = "w-6 h-6", color = "currentColor", animated = true }: { className?: string; color?: string; animated?: boolean }) => (
    <motion.svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Film reel */}
      <g>
        {/* Outer circle */}
        <motion.circle
          cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="1.5"
          animate={animated ? { rotate: 360 } : {}}
          transition={animated ? { duration: 3, repeat: Infinity, ease: "linear" } : {}}
        />
        
        {/* Center hub */}
        <circle cx="12" cy="12" r="2" fill={color} />
        
        {/* Film spokes */}
        {[0, 90, 180, 270].map((angle) => (
          <line
            key={angle}
            x1="12" y1="12"
            x2={12 + 8 * Math.cos((angle * Math.PI) / 180)}
            y2={12 + 8 * Math.sin((angle * Math.PI) / 180)}
            stroke={color}
            strokeWidth="1"
          />
        ))}
        
        {/* Film perforations */}
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <circle
            key={`perf-${angle}`}
            cx={12 + 9 * Math.cos((angle * Math.PI) / 180)}
            cy={12 + 9 * Math.sin((angle * Math.PI) / 180)}
            r="0.8"
            fill={color}
            opacity="0.6"
          />
        ))}
      </g>
    </motion.svg>
  ),

  // EVENTS / CELEBRATION
  Celebration: ({ className = "w-6 h-6", color = "currentColor", animated = true }: { className?: string; color?: string; animated?: boolean }) => (
    <motion.svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Balloons */}
      <g>
        {/* Balloon 1 */}
        <motion.ellipse
          cx="6" cy="8" rx="2" ry="3" fill={color}
          animate={animated ? { y: [0, -2, 0] } : {}}
          transition={animated ? { duration: 1.5, repeat: Infinity, delay: 0 } : {}}
        />
        <line x1="6" y1="11" x2="6" y2="20" stroke={color} strokeWidth="0.5" />
        
        {/* Balloon 2 */}
        <motion.ellipse
          cx="12" cy="7" rx="2" ry="3" fill={color} opacity="0.7"
          animate={animated ? { y: [0, -2, 0] } : {}}
          transition={animated ? { duration: 1.5, repeat: Infinity, delay: 0.15 } : {}}
        />
        <line x1="12" y1="10" x2="12" y2="20" stroke={color} strokeWidth="0.5" opacity="0.7" />
        
        {/* Balloon 3 */}
        <motion.ellipse
          cx="18" cy="8" rx="2" ry="3" fill={color} opacity="0.5"
          animate={animated ? { y: [0, -2, 0] } : {}}
          transition={animated ? { duration: 1.5, repeat: Infinity, delay: 0.3 } : {}}
        />
        <line x1="18" y1="11" x2="18" y2="20" stroke={color} strokeWidth="0.5" opacity="0.5" />
      </g>
      
      {/* Confetti particles */}
      {[0, 1, 2].map((i) => (
        <motion.rect
          key={`confetti-${i}`}
          x={6 + i * 6}
          y="2"
          width="1"
          height="2"
          fill={color}
          opacity="0.6"
          animate={animated ? { y: [2, 18], opacity: [1, 0], rotate: [0, 360] } : {}}
          transition={animated ? { duration: 2, repeat: Infinity, delay: i * 0.2 } : {}}
        />
      ))}
    </motion.svg>
  ),

  // NAVIGATION ICONS
  Community: ({ className = "w-6 h-6", color = "currentColor", animated = true }: { className?: string; color?: string; animated?: boolean }) => (
    <motion.svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Center person */}
      <motion.circle
        cx="12" cy="6" r="2.5" fill={color}
        animate={animated ? { scale: [1, 1.1, 1] } : {}}
        transition={animated ? { duration: 2, repeat: Infinity } : {}}
      />
      
      {/* Left person */}
      <circle cx="6" cy="8" r="1.8" fill={color} opacity="0.7" />
      
      {/* Right person */}
      <circle cx="18" cy="8" r="1.8" fill={color} opacity="0.7" />
      
      {/* Group body */}
      <path d="M12 9C10 9 8.5 10 8.5 12V18C8.5 18.5 9 19 9.5 19H14.5C15 19 15.5 18.5 15.5 18V12C15.5 10 14 9 12 9Z" fill={color} opacity="0.8" />
      
      {/* Side bodies */}
      <path d="M2 15V18C2 18.5 2.5 19 3 19H5C5.5 19 6 18.5 6 18V15C6 13.5 4.5 12 3 12C1.5 12 2 13.5 2 15Z" fill={color} opacity="0.5" />
      <path d="M22 15V18C22 18.5 21.5 19 21 19H19C18.5 19 18 18.5 18 18V15C18 13.5 19.5 12 21 12C22.5 12 22 13.5 22 15Z" fill={color} opacity="0.5" />
    </motion.svg>
  ),

  Services: ({ className = "w-6 h-6", color = "currentColor", animated = true }: { className?: string; color?: string; animated?: boolean }) => (
    <motion.svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Grid of service boxes */}
      {[
        [3, 3], [9, 3], [15, 3],
        [3, 9], [9, 9], [15, 9],
        [3, 15], [9, 15], [15, 15]
      ].map((pos, i) => (
        <motion.rect
          key={`service-box-${i}`}
          x={pos[0]}
          y={pos[1]}
          width="4"
          height="4"
          rx="0.5"
          fill={color}
          opacity={0.3 + (i % 3) * 0.2}
          animate={animated ? { scale: [1, 1.05, 1] } : {}}
          transition={animated ? { duration: 1.5, repeat: Infinity, delay: i * 0.1 } : {}}
        />
      ))}
    </motion.svg>
  ),

  Chat: ({ className = "w-6 h-6", color = "currentColor", animated = true }: { className?: string; color?: string; animated?: boolean }) => (
    <motion.svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main bubble */}
      <path d="M2 10C2 6 5 3 9 3H18C21 3 23 5 23 8V16C23 19 21 21 18 21H9C5 21 2 18 2 14V10Z" fill={color} opacity="0.8" />
      
      {/* Message lines */}
      <motion.line
        x1="6" y1="9" x2="16" y2="9" stroke="white" strokeWidth="1"
        animate={animated ? { opacity: [0.5, 1, 0.5] } : {}}
        transition={animated ? { duration: 2, repeat: Infinity } : {}}
      />
      <motion.line
        x1="6" y1="13" x2="14" y2="13" stroke="white" strokeWidth="1"
        animate={animated ? { opacity: [0.5, 1, 0.5] } : {}}
        transition={animated ? { duration: 2, repeat: Infinity, delay: 0.2 } : {}}
      />
      
      {/* Pointer */}
      <path d="M9 21L6 24V21" fill={color} opacity="0.8" />
    </motion.svg>
  ),

  Profile: ({ className = "w-6 h-6", color = "currentColor", animated = true }: { className?: string; color?: string; animated?: boolean }) => (
    <motion.svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Head */}
      <motion.circle
        cx="12" cy="7" r="3.5" fill={color}
        animate={animated ? { scale: [1, 1.05, 1] } : {}}
        transition={animated ? { duration: 2, repeat: Infinity } : {}}
      />
      
      {/* Body */}
      <path d="M8 12C8 10 10 9 12 9C14 9 16 10 16 12V19C16 20 15.5 21 14 21H10C8.5 21 8 20 8 19V12Z" fill={color} opacity="0.8" />
      
      {/* Accent circle */}
      <motion.circle
        cx="12" cy="12" r="8" fill="none" stroke={color} strokeWidth="0.5" opacity="0.3"
        animate={animated ? { r: [8, 9, 8] } : {}}
        transition={animated ? { duration: 2, repeat: Infinity } : {}}
      />
    </motion.svg>
  ),

  Live: ({ className = "w-6 h-6", color = "currentColor", animated = true }: { className?: string; color?: string; animated?: boolean }) => (
    <motion.svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Center dot */}
      <motion.circle
        cx="12" cy="12" r="2.5" fill={color}
        animate={animated ? { r: [2.5, 3.5, 2.5] } : {}}
        transition={animated ? { duration: 1, repeat: Infinity } : {}}
      />
      
      {/* Ripple 1 */}
      <motion.circle
        cx="12" cy="12" r="4" fill="none" stroke={color} strokeWidth="1" opacity="0.7"
        animate={animated ? { r: [4, 8, 4], opacity: [0.7, 0, 0.7] } : {}}
        transition={animated ? { duration: 1.5, repeat: Infinity } : {}}
      />
      
      {/* Ripple 2 */}
      <motion.circle
        cx="12" cy="12" r="4" fill="none" stroke={color} strokeWidth="1" opacity="0.4"
        animate={animated ? { r: [4, 8, 4], opacity: [0.4, 0, 0.4] } : {}}
        transition={animated ? { duration: 1.5, repeat: Infinity, delay: 0.5 } : {}}
      />
    </motion.svg>
  ),

  // ACTION ICONS
  Heart: ({ className = "w-6 h-6", color = "currentColor", filled = false, animated = true }: { className?: string; color?: string; filled?: boolean; animated?: boolean }) => (
    <motion.svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? color : "none"}
      xmlns="http://www.w3.org/2000/svg"
      whileHover={animated ? { scale: 1.15 } : {}}
      whileTap={animated ? { scale: 0.95 } : {}}
    >
      <motion.path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={filled && animated ? { scale: [1, 1.1, 1] } : {}}
        transition={filled && animated ? { duration: 0.3 } : {}}
      />
    </motion.svg>
  ),

  Share: ({ className = "w-6 h-6", color = "currentColor", animated = true }: { className?: string; color?: string; animated?: boolean }) => (
    <motion.svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      whileHover={animated ? { scale: 1.1 } : {}}
    >
      {/* Share arrow */}
      <motion.path
        d="M13 3L7 9M7 9H2M7 9L2 9V14"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={animated ? { x: [-1, 1, -1] } : {}}
        transition={animated ? { duration: 1.5, repeat: Infinity } : {}}
      />
      
      {/* Target nodes */}
      <circle cx="20" cy="6" r="1.5" fill={color} opacity="0.7" />
      <circle cx="6" cy="18" r="1.5" fill={color} opacity="0.7" />
    </motion.svg>
  ),

  Comment: ({ className = "w-6 h-6", color = "currentColor", animated = true }: { className?: string; color?: string; animated?: boolean }) => (
    <motion.svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      whileHover={animated ? { scale: 1.1 } : {}}
    >
      <path d="M3 11C3 7 6 4 10 4H18C21 4 23 6 23 9V15C23 18 21 20 18 20H10C6 20 3 17 3 13V11Z" fill={color} opacity="0.8" />
      
      {/* Comment dots */}
      <motion.circle cx="7" cy="12" r="1" fill="white" animate={animated ? { opacity: [0.5, 1, 0.5] } : {}} transition={animated ? { duration: 1.5, repeat: Infinity } : {}} />
      <motion.circle cx="12" cy="12" r="1" fill="white" animate={animated ? { opacity: [0.5, 1, 0.5] } : {}} transition={animated ? { duration: 1.5, repeat: Infinity, delay: 0.2 } : {}} />
      <motion.circle cx="17" cy="12" r="1" fill="white" animate={animated ? { opacity: [0.5, 1, 0.5] } : {}} transition={animated ? { duration: 1.5, repeat: Infinity, delay: 0.4 } : {}} />
    </motion.svg>
  ),

  Sparkles: ({ className = "w-6 h-6", color = "currentColor", animated = true }: { className?: string; color?: string; animated?: boolean }) => (
    <motion.svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main star */}
      <motion.g animate={animated ? { rotate: 360 } : {}} transition={animated ? { duration: 3, repeat: Infinity, ease: "linear" } : {}}>
        <path d="M12 2L14.09 8.91H21.77L15.34 13.09L17.43 19.91L12 15.73L6.57 19.91L8.66 13.09L2.23 8.91H9.91L12 2Z" fill={color} />
      </motion.g>
      
      {/* Secondary sparkles */}
      {[{ x: 3, y: 5 }, { x: 20, y: 6 }, { x: 18, y: 18 }].map((pos, i) => (
        <motion.circle
          key={`sparkle-${i}`}
          cx={pos.x}
          cy={pos.y}
          r="1"
          fill={color}
          opacity="0.6"
          animate={animated ? { scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] } : {}}
          transition={animated ? { duration: 1.5, repeat: Infinity, delay: i * 0.2 } : {}}
        />
      ))}
    </motion.svg>
  ),

  Location: ({ className = "w-6 h-6", color = "currentColor", animated = true }: { className?: string; color?: string; animated?: boolean }) => (
    <motion.svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Pin */}
      <motion.path
        d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2Z"
        fill={color}
        animate={animated ? { y: [0, -2, 0] } : {}}
        transition={animated ? { duration: 1.5, repeat: Infinity } : {}}
      />
      
      {/* Inner circle */}
      <motion.circle cx="12" cy="9" r="3" fill="white" opacity="0.7" animate={animated ? { r: [3, 3.5, 3] } : {}} transition={animated ? { duration: 1.5, repeat: Infinity } : {}} />
      
      {/* Ripple effect */}
      <motion.circle cx="12" cy="9" r="5" fill="none" stroke={color} strokeWidth="0.5" opacity="0.3" animate={animated ? { r: [5, 8, 5], opacity: [0.3, 0, 0.3] } : {}} transition={animated ? { duration: 2, repeat: Infinity } : {}} />
    </motion.svg>
  ),

  Verified: ({ className = "w-6 h-6", color = "currentColor", animated = true }: { className?: string; color?: string; animated?: boolean }) => (
    <motion.svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Shield */}
      <motion.path
        d="M12 2L2 7V12C2 18 12 22 12 22C12 22 22 18 22 12V7L12 2Z"
        fill={color}
        animate={animated ? { scale: [1, 1.05, 1] } : {}}
        transition={animated ? { duration: 2, repeat: Infinity } : {}}
      />
      
      {/* Check mark */}
      <motion.path
        d="M8 12L11 15L16 9"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={animated ? { pathLength: 0 } : {}}
        animate={animated ? { pathLength: 1 } : {}}
        transition={animated ? { duration: 0.5 } : {}}
      />
    </motion.svg>
  ),
};

// Icon wrapper component
interface PremiumIconProps {
  icon: keyof typeof PremiumIcons;
  className?: string;
  color?: string;
  filled?: boolean;
  animated?: boolean;
}

export function PremiumIcon({ icon, className = "w-6 h-6", color = "currentColor", filled, animated = true }: PremiumIconProps) {
  const IconComponent = PremiumIcons[icon] as React.ComponentType<any>;
  return <IconComponent className={className} color={color} filled={filled} animated={animated} />;
}

// Icon size variants
export const iconSizes = {
  xs: "w-4 h-4",
  sm: "w-5 h-5",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-10 h-10",
  "2xl": "w-12 h-12",
} as const;

// Color variants for theming
export const iconColors = {
  primary: "#FF6B35",
  secondary: "#9D4EDD",
  accent: "#00D9FF",
  success: "#3a7d44",
  warning: "#FFB703",
  error: "#d62246",
  white: "#ffffff",
} as const;
