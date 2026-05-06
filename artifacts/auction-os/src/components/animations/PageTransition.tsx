import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animationVariants } from "../../lib/animations";

interface PageTransitionProps {
  children: React.ReactNode;
  delay?: number;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children, delay = 0 }) => {
  return (
    <motion.div
      initial={animationVariants.fadeInUp.initial}
      animate={animationVariants.fadeInUp.animate}
      exit={animationVariants.fadeInUp.exit}
      transition={animationVariants.fadeInUp.transition}
      style={{ width: "100%" }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
