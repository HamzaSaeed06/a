import { Variants } from "framer-motion";

export const animationVariants = {
  // Fade animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  } as Variants,

  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.4, ease: "easeOut" },
  } as Variants,

  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4, ease: "easeOut" },
  } as Variants,

  // Slide animations
  slideInRight: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 100 },
    transition: { duration: 0.4, ease: "easeOut" },
  } as Variants,

  slideInLeft: {
    initial: { opacity: 0, x: -100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
    transition: { duration: 0.4, ease: "easeOut" },
  } as Variants,

  // Scale animations
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: { duration: 0.5, ease: "easeOut" },
  } as Variants,

  scaleInBounce: {
    initial: { opacity: 0, scale: 0.7 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.7 },
    transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] },
  } as Variants,

  // Bounce animations
  bounceIn: {
    initial: { opacity: 0, scale: 0.3 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.3 },
    transition: {
      duration: 0.6,
      ease: [0.68, -0.55, 0.265, 1.55],
    },
  } as Variants,

  // Stagger container
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  } as Variants,

  // Individual stagger item
  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.4, ease: "easeOut" },
  } as Variants,

  // Rotate animations
  rotateIn: {
    initial: { opacity: 0, rotate: -10 },
    animate: { opacity: 1, rotate: 0 },
    exit: { opacity: 0, rotate: -10 },
    transition: { duration: 0.5, ease: "easeOut" },
  } as Variants,

  // Flip animation (3D)
  flipInX: {
    initial: { opacity: 0, rotateX: 90 },
    animate: { opacity: 1, rotateX: 0 },
    exit: { opacity: 0, rotateX: 90 },
    transition: { duration: 0.6, ease: "easeOut" },
  } as Variants,
};

// Predefined transition configs
export const transitions = {
  standard: { duration: 0.3, ease: "easeInOut" },
  smooth: { duration: 0.4, ease: "easeInOut" },
  bouncy: { type: "spring", damping: 10, stiffness: 100 },
  snappy: { type: "spring", damping: 15, stiffness: 150 },
};

// Easing functions
export const easing = {
  easeInOutCirc: [0.85, 0, 0.15, 1],
  easeOutCubic: [0.215, 0.61, 0.355, 1],
  easeInCubic: [0.55, 0.055, 0.675, 0.19],
  easeOutQuad: [0.25, 0.46, 0.45, 0.94],
};

// Number counter animation
export const numberVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.5 },
} as Variants;
