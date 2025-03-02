
import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Info, Clock, BarChart2, Tag, Sparkles } from 'lucide-react';
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
  imageUrl?: string;
  isAiGenerated?: boolean;
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
  imageUrl,
  isAiGenerated = false
}) => {
  // Load images lazily to improve initial render time
  const imageOptions = { loading: 'lazy' } as React.ImgHTMLAttributes<HTMLImageElement>;
  
  // Use lighter animations for better performance
  const containerAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: "easeOut" }
  };
  
  const listItemAnimation = {
    initial: { opacity: 0, x: -5 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.2 }
  };

  // Parse howTo steps if they're in a Step 1: format
  const howToSteps = howTo.split(/\n+/).filter(step => step.trim());
  const hasFormattedSteps = howToSteps.length > 0 && howToSteps[0].match(/^Step \d+:/);

  return (
    <motion.div
      {...containerAnimation}
      className={cn(
        "w-full max-w-2xl mx-auto mt-8 overflow-hidden",
        "rounded-2xl border border-border bg-white shadow-sm",
        "backdrop-blur-sm",
        isAiGenerated ? "border-purple-200" : "",
        className
      )}
    >
      {imageUrl && (
        <div className="w-full h-56 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={ideaTitle || itemName} 
            className="w-full h-full object-cover transition-transform hover:scale-105"
            {...imageOptions}
          />
        </div>
      )}
      
      <div className="p-6 md:p-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {materialType}
              </span>
              {isAiGenerated && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Generated
                </span>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-medium text-foreground line-clamp-2">
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
                <span className="line-clamp-1">{tags.join(', ')}</span>
              </div>
            )}
          </div>
        )}

        <ul className="mt-6 space-y-3">
          {suggestions.slice(0, 4).map((suggestion, index) => (
            <motion.li
              key={index}
              {...listItemAnimation}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="flex items-start"
            >
              <span className={`flex-shrink-0 w-6 h-6 rounded-full ${isAiGenerated ? 'bg-purple-100 text-purple-800' : 'bg-primary/10 text-primary'} flex items-center justify-center mt-0.5 mr-3`}>
                {index + 1}
              </span>
              <span className="text-foreground">{suggestion}</span>
            </motion.li>
          ))}
          {suggestions.length > 4 && (
            <motion.li
              {...listItemAnimation}
              transition={{ duration: 0.2, delay: 0.2 }}
              className="flex items-center justify-center text-sm text-muted-foreground mt-1"
            >
              <span>and {suggestions.length - 4} more steps</span>
            </motion.li>
          )}
        </ul>

        {howTo && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className={`mt-6 p-4 rounded-xl ${isAiGenerated ? 'bg-purple-50 border border-purple-200' : 'bg-secondary border border-border'}`}
          >
            <div className="flex items-start">
              <Info className={`w-5 h-5 ${isAiGenerated ? 'text-purple-800' : 'text-primary'} mt-0.5 mr-3 flex-shrink-0`} />
              <div>
                <h4 className="font-medium text-foreground mb-2">How to do it:</h4>
                {hasFormattedSteps ? (
                  <ul className="space-y-2">
                    {howToSteps.map((step, index) => {
                      const stepMatch = step.match(/^Step (\d+):(.*)/);
                      if (stepMatch) {
                        const [, number, content] = stepMatch;
                        return (
                          <li key={index} className="flex items-start">
                            <span className={`flex-shrink-0 w-6 h-6 rounded-full ${isAiGenerated ? 'bg-purple-100 text-purple-800' : 'bg-primary/10 text-primary'} flex items-center justify-center mt-0.5 mr-3`}>
                              {number}
                            </span>
                            <span className="text-muted-foreground text-sm">{content.trim()}</span>
                          </li>
                        );
                      }
                      return null;
                    })}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm whitespace-pre-line">{howTo}</p>
                )}
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

export default React.memo(ResultCard);
