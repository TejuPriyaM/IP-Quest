import React from 'react';

const LOGO_MARK_SRC = '/logo-mark.png';
const FULL_LOGO_SRC = '/logo.png';

export const IPQuestBadge = ({
  className = '',
  size = 56,
  variant = 'mark',
  showText = true
}) => {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;
  const imageSrc = variant === 'full' ? FULL_LOGO_SRC : LOGO_MARK_SRC;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
      title="IP Quest: Explore • Learn • Build a Safer Tomorrow"
    >
      <img
        src={imageSrc}
        alt={variant === 'full' ? 'IP Quest: Explore · Learn · Build a Safer Tomorrow' : 'IP Quest emblem'}
        className={`h-full w-full select-none object-contain pointer-events-none transition-transform ${
          variant === 'full' ? 'mix-blend-multiply' : 'drop-shadow-[0_3px_8px_rgba(245,158,11,0.22)]'
        }`}
        loading="eager"
      />
    </div>
  );
};
