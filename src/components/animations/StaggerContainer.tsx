import React from "react";
import { motion } from "framer-motion";
import { animationVariants } from "../../lib/animations";

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  staggerDelay?: number;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  className = "",
  delay = 0,
  staggerDelay = 0.05,
}) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{
        animate: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
}

export const StaggerItem: React.FC<StaggerItemProps> = ({ children, className = "" }) => {
  return (
    <motion.div
      variants={animationVariants.staggerItem}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default StaggerContainer;
