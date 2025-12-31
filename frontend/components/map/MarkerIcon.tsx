import React from 'react';

interface MarkerIconProps {
  size?: number;
  color?: string;
  borderColor?: string;
  shadow?: boolean;
}

export const MarkerIcon: React.FC<MarkerIconProps> = ({
  size = 40,
  color = '#ef4444',
  borderColor = 'white',
  shadow = true,
}) => {
  // Pin shape path (normalized for viewBox 0 0 24 28)
  const path = "M 12 2.1 C 7.3 2.1 3.5 5.9 3.5 10.6 c 0 5.2 7 13.9 7.9 15.1 c 0.3 0.4 0.9 0.4 1.2 0 C 13.5 24.5 20.5 15.8 20.5 10.6 c 0 -4.7 -3.8 -8.5 -8.5 -8.5 z";
  
  return (
    <div 
      style={{ 
        width: size, 
        height: size, 
        filter: shadow ? 'drop-shadow(0px 2px 3px rgba(0,0,0,0.3))' : 'none',
        transform: 'translate(-50%, -100%)' // Anchor at bottom center
      }}
      className="relative pointer-events-none"
    >
      <svg
        viewBox="0 0 24 28"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        {/* Stroke Layer (White Border) */}
        <path
          d={path}
          fill={borderColor}
          stroke={borderColor}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Main Color Layer */}
        <path
          d={path}
          fill={color}
        />
        {/* Central Dot/Hole */}
        <circle cx="12" cy="10.5" r="3.5" fill="white" />
      </svg>
    </div>
  );
};

