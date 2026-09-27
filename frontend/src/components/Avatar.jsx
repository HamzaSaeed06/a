import React, { useState } from 'react';

export const Avatar = ({ src, alt = 'Avatar', className = 'w-10 h-10 rounded-full', fallbackName = '' }) => {
  const [hasError, setHasError] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'SW';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getBgColor = (name) => {
    let hash = 0;
    const str = name || 'SafeWatch';
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 65%, 45%)`;
  };

  if (hasError || !src) {
    const initials = getInitials(fallbackName || alt);
    const bgColor = getBgColor(fallbackName || alt);
    return (
      <div
        className={`${className} flex items-center justify-center text-white font-semibold text-xs border border-white/20 shadow-sm flex-shrink-0`}
        style={{ backgroundColor: bgColor }}
        title={alt}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className={`${className} object-cover flex-shrink-0`}
    />
  );
};

export default Avatar;
