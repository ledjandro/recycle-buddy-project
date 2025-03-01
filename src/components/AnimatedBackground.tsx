
import React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedBackgroundProps {
  className?: string;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ className }) => {
  return (
    <div className={cn("fixed inset-0 -z-10 overflow-hidden", className)}>
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-background via-primary/5"></div>
      
      {/* Animated shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-50">
        <div className="absolute top-[10%] left-[10%] w-64 h-64 rounded-full bg-primary/5 animate-float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-[50%] right-[20%] w-96 h-96 rounded-full bg-primary/5 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-[10%] left-[30%] w-80 h-80 rounded-full bg-primary/5 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {/* Blur effect */}
      <div className="absolute inset-0 backdrop-blur-[100px]"></div>
    </div>
  );
};

export default AnimatedBackground;
