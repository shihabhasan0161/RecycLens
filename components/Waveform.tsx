import React from 'react';

interface WaveformProps {
  active: boolean;
  volume: number; // 0 to 1
  color?: string;
}

export const Waveform: React.FC<WaveformProps> = ({ active, volume, color = "bg-green-400" }) => {
  if (!active) return <div className="h-12 w-full" />;

  // Create 5 bars that animate based on volume
  const bars = [1, 2, 3, 4, 5];
  
  // Amplify volume for visual effect
  const visualVol = Math.min(1, volume * 5); 

  return (
    <div className="flex items-center justify-center space-x-1 h-12">
      {bars.map((i) => (
        <div
          key={i}
          className={`w-2 rounded-full transition-all duration-75 ${color}`}
          style={{
            height: `${Math.max(15, visualVol * 40 * (Math.random() * 0.5 + 0.5))}px`,
            opacity: Math.max(0.4, visualVol)
          }}
        />
      ))}
    </div>
  );
};
