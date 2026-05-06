import React from "react";
import { motion } from "framer-motion";
import { animationVariants } from "../../lib/animations";

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hoverable?: boolean;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = "",
  delay = 0,
  hoverable = true,
}) => {
  return (
    <motion.div
      initial={animationVariants.scaleIn.initial}
      animate={animationVariants.scaleIn.animate}
      exit={animationVariants.scaleIn.exit}
      transition={animationVariants.scaleIn.transition}
      whileHover={hoverable ? { y: -8, transition: { duration: 0.2 } } : undefined}
      className={className}
      style={{
        transformOrigin: "center",
      }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
