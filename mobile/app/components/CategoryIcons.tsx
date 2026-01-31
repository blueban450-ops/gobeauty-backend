// This is a placeholder for 2025-style grey category icons.
// You should replace these with real SVGs or PNGs for production.
import * as React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

export const CategoryDefaultIcon = ({ size = 32, color = '#9ca3af' }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <Circle cx="16" cy="16" r="15" stroke={color} strokeWidth="2" fill="#f3f4f6" />
    <Path d="M10 18l6-6 6 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Add more icons for specific categories as needed, e.g.:
export const CategorySalonIcon = ({ size = 32, color = '#9ca3af' }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <Circle cx="16" cy="16" r="15" stroke={color} strokeWidth="2" fill="#f3f4f6" />
    <Path d="M12 20c0-4 8-4 8 0" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M16 12v2" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M14 16h4" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

// ...add more as needed
