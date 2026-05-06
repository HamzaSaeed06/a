import React from "react";
import { motion } from "framer-motion";

interface SkeletonLoaderProps {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  className?: string;
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = "100%",
  height = 20,
  circle = false,
  className = "",
  count = 1,
}) => {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={`animate-shimmer ${circle ? "rounded-full" : "rounded-md"} ${
            i > 0 ? "mt-3" : ""
          }`}
          style={{
            width,
            height,
          }}
        />
      ))}
    </div>
  );
};

export const SkeletonCardLoader: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 p-6 bg-slate-50 rounded-lg"
    >
      <SkeletonLoader height={24} width="60%" />
      <SkeletonLoader height={16} width="100%" count={3} />
      <div className="flex gap-2 mt-4">
        <SkeletonLoader height={10} width="30%" />
        <SkeletonLoader height={10} width="20%" />
      </div>
    </motion.div>
  );
};

export default SkeletonLoader;
