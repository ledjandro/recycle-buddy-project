
import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Info, Clock, BarChart2 } from 'lucide-react';

interface ResultCardProps {
  itemName: string;
  suggestions: string[];
  howTo: string;
  isGeneric?: boolean;
  className?: string;
  timeRequired?: number | null;
  difficultyLevel?: number | null;
  coverImageUrl?: string | null;
}

const ResultCard: React.FC<ResultCardProps> = ({
  itemName,
  suggestions,
  howTo,
  isGeneric = false,
  className,
  timeRequired,
  difficultyLevel,
  coverImageUrl
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "w-full max-w-2xl mx-auto mt-8 overflow-hidden",
        "rounded-2xl border border-border bg-white shadow-sm",
        "backdrop-blur-sm",
        className
      )}
    >
      <div className="p-6 md:p-8">
        <div className="flex items-start justify-between">
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mb-2">
              Recycling Ideas
            </span>
            <h2 className="text-xl md:text-2xl font-medium text-foreground">
              {isGeneric 
                ? `General Tips for "${itemName}"` 
                : `Recycling Ideas for ${itemName.charAt(0).toUpperCase() + itemName.slice(1)}`
              }
            </h2>
          </div>
        </div>

        {!isGeneric && (
          <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
            {timeRequired && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{timeRequired} mins</span>
              </div>
            )}
            {difficultyLevel && (
              <div className="flex items-center gap-1">
                <BarChart2 className="w-4 h-4" />
                <span>
                  Difficulty: {difficultyLevel}/5
                </span>
              </div>
            )}
          </div>
        )}

        <ul className="mt-6 space-y-3">
          {suggestions.map((suggestion, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-start"
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center mt-0.5 mr-3">
                {index + 1}
              </span>
              <span className="text-foreground">{suggestion}</span>
            </motion.li>
          ))}
        </ul>

        {howTo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="mt-6 p-4 rounded-xl bg-secondary border border-border"
          >
            <div className="flex items-start">
              <Info className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-foreground mb-1">How to do it:</h4>
                <p className="text-muted-foreground text-sm whitespace-pre-line">{howTo}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ResultCard;
