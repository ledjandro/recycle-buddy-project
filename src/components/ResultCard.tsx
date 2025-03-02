
import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Info, Clock, BarChart2, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface ResultCardProps {
  itemName: string;
  materialType: string;
  ideaTitle: string | null;
  suggestions: string[];
  howTo: string;
  isGeneric?: boolean;
  className?: string;
  timeRequired?: number | null;
  difficultyLevel?: number | null;
  tags?: string[];
  isDetailPage?: boolean;
  imageUrl?: string;  // Keeping this optional
}

const ResultCard: React.FC<ResultCardProps> = ({
  itemName,
  materialType,
  ideaTitle,
  suggestions,
  howTo,
  isGeneric = false,
  className,
  timeRequired,
  difficultyLevel,
  tags,
  isDetailPage = false,
  imageUrl
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
      {imageUrl && (
        <div className="w-full h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={ideaTitle || `${itemName} recycling idea`}
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </div>
      )}
      <div className="p-6 md:p-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mb-2">
              {materialType}
            </span>
            <h2 className="text-xl md:text-2xl font-medium text-foreground">
              {isGeneric 
                ? `General Tips for "${itemName}"` 
                : `${ideaTitle || `Recycling Ideas for ${itemName}`}`
              }
            </h2>
          </div>
        </div>

        {!isGeneric && (
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex items-center gap-1 text-sm text-muted-foreground bg-secondary px-2 py-1 rounded">
              <Clock className="w-4 h-4" />
              <span>{timeRequired ? `${timeRequired} mins` : 'Time varies'}</span>
            </div>
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground bg-secondary px-2 py-1 rounded">
              <BarChart2 className="w-4 h-4" />
              <span>Difficulty: {difficultyLevel ? `${difficultyLevel}/5` : 'Varies'}</span>
            </div>

            {tags && tags.length > 0 && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground bg-secondary px-2 py-1 rounded">
                <Tag className="w-4 h-4" />
                <span>{tags.join(', ')}</span>
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

        {isDetailPage && (
          <div className="mt-6">
            <Link to="/">
              <Button variant="outline" className="w-full">
                Back to Search
              </Button>
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ResultCard;
