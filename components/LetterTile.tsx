
import React from 'react';
import { motion, Variants } from 'framer-motion';

interface LetterTileProps {
  char?: string;
  onClick?: () => void;
  status?: 'default' | 'placed' | 'correct' | 'incorrect' | 'empty';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  layoutId?: string;
  index?: number;
}

const LetterTile: React.FC<LetterTileProps> = ({ 
  char, 
  onClick, 
  status = 'default', 
  size = 'md',
  disabled = false,
  layoutId,
  index = 0
}) => {
  
  // Base styles
  const baseStyles = "relative flex items-center justify-center font-bold rounded-lg shadow-sm select-none z-10";
  
  const sizeStyles = {
    sm: "w-10 h-10 text-lg border-2",
    md: "w-12 h-12 sm:w-14 sm:h-14 text-xl sm:text-2xl border-b-4 border-2",
    lg: "w-16 h-16 text-3xl border-b-4 border-2"
  };

  // CSS Colors and Borders
  const statusStyles = {
    default: "bg-white text-slate-800 border-slate-200 border-b-slate-300 cursor-pointer",
    placed: "bg-indigo-100 text-indigo-900 border-indigo-300 border-b-indigo-400 cursor-pointer hover:bg-indigo-200",
    correct: "bg-green-500 text-white border-green-600 border-b-green-700 cursor-default",
    incorrect: "bg-red-500 text-white border-red-600 border-b-red-700 cursor-default",
    empty: "bg-slate-800/50 border-2 border-slate-700 border-dashed text-transparent cursor-default"
  };

  const interactiveStyles = disabled ? "cursor-default opacity-80 pointer-events-none" : "";

  const finalStyles = `
    ${baseStyles} 
    ${sizeStyles[size]} 
    ${statusStyles[status]} 
    ${interactiveStyles}
  `;

  const isInteractive = !disabled && status !== 'empty' && status !== 'correct' && status !== 'incorrect';

  // Motion Variants
  const variants: Variants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: (i: number) => ({ 
      opacity: 1,
      scale: 1,
      y: status === 'correct' ? [0, -10, 0] : 0,
      rotate: status === 'incorrect' ? [0, -5, 5, -5, 5, 0] : 0,
      transition: {
         type: "spring",
         stiffness: 500,
         damping: 30,
         // Stagger effect for winning state
         delay: status === 'correct' ? i * 0.05 : 0
      }
    }),
    exit: { scale: 0.5, opacity: 0 },
    hover: { 
      y: -4, 
      scale: 1.05,
      transition: { type: "spring", stiffness: 400, damping: 10 }
    },
    tap: { 
      y: 0, 
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  if (status === 'empty') {
    return (
      <motion.div 
        className={finalStyles}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {char}
      </motion.div>
    );
  }

  return (
    <motion.div
      layoutId={layoutId}
      custom={index}
      className={finalStyles}
      onClick={!disabled ? onClick : undefined}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover={isInteractive ? "hover" : undefined}
      whileTap={isInteractive ? "tap" : undefined}
    >
      {char}
    </motion.div>
  );
};

export default LetterTile;
