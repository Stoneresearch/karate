import React from 'react';
import { motion } from 'framer-motion';

type LoaderProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  className?: string;
  variant?: 'spinner' | 'dots';
};

export const Loader = ({ size = 'md', className = '', variant = 'spinner' }: LoaderProps) => {
  const sizePx = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
    xxl: 128,
  };
  
  const s = sizePx[size];

  if (variant === 'dots') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="bg-current rounded-full"
            style={{ width: s / 4, height: s / 4 }}
            animate={{
              y: ["0%", "-50%", "0%"],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: s, height: s }}>
       {/* Outer Ring - Faint */}
      <div 
        className="absolute inset-0 rounded-full border-[3px] border-current opacity-20" 
      />
      
      {/* Inner Spinning Ring - Gradient-like effect via partial border */}
      <motion.div
        className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-current border-l-current"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Center Pulse (optional, for extra flair) */}
      <motion.div 
        className="absolute bg-current rounded-full opacity-0"
        style={{ width: s/2, height: s/2 }}
        animate={{ opacity: [0, 0.2, 0], scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
};

