
import React from 'react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  return (
    <header className={cn("w-full text-center py-6 animate-fade-in", className)}>
      <div className="inline-flex items-center gap-2 mb-1">
        <div className="relative">
          <span className="text-4xl md:text-5xl animate-float inline-block">♻️</span>
          <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary/20 rounded-full blur-lg animate-pulse-soft"></span>
        </div>
        <h1 className="text-3xl md:text-4xl font-light tracking-tight">
          <span className="font-medium text-primary">Recycl</span>it
        </h1>
      </div>
      <p className="text-muted-foreground max-w-md mx-auto text-balance mt-3 text-sm md:text-base">
        Enter an item you don't use anymore, and we'll suggest ways to recycle or repurpose it.
      </p>
    </header>
  );
};

export default Header;
