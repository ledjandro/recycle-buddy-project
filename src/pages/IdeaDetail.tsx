
import React, { useState, useEffect } from 'react';
import { useLocation, Navigate, useNavigate } from 'react-router-dom';
import ResultCard from '@/components/ResultCard';
import AnimatedBackground from '@/components/AnimatedBackground';
import { SearchResult } from '@/services/supabaseService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Plus, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const IdeaDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const ideaData = location.state as SearchResult | null;
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [activeIdeaIndex, setActiveIdeaIndex] = useState<number>(0);
  const [relatedIdeas, setRelatedIdeas] = useState<any[]>([]);
  const [showMoreIdeas, setShowMoreIdeas] = useState<boolean>(false);

  useEffect(() => {
    // Set available tags from the idea data
    if (ideaData && ideaData.tags && ideaData.tags.length > 0) {
      setAvailableTags(ideaData.tags);
    }
    
    // Initialize filtered suggestions with all suggestions
    if (ideaData) {
      setFilteredSuggestions(ideaData.suggestions);
    }

    // Prepare related ideas array
    if (ideaData && ideaData.relatedIdeas && ideaData.relatedIdeas.length > 0) {
      setRelatedIdeas(ideaData.relatedIdeas);
      setShowMoreIdeas(true);
    } else {
      setRelatedIdeas([]);
      setShowMoreIdeas(false);
    }
  }, [ideaData]);

  // If no data was passed, redirect back to home
  if (!ideaData) {
    return <Navigate to="/" replace />;
  }

  const handleTagSelect = (tag: string) => {
    setSelectedTag(tag);
    
    // If no tag is selected (showing all), reset to all suggestions
    if (tag === "all") {
      setFilteredSuggestions(ideaData.suggestions);
      return;
    }
    
    // This is a placeholder for tag filtering logic
    // In a real app, you would have tag-specific suggestions in your data model
    const tagRelatedSuggestions = ideaData.suggestions.filter(
      (_, index) => index % 2 === (tag === availableTags[0] ? 0 : 1)
    );
    
    setFilteredSuggestions(tagRelatedSuggestions.length > 0 
      ? tagRelatedSuggestions 
      : ideaData.suggestions
    );
  };

  const nextIdea = () => {
    if (relatedIdeas.length > 0) {
      setActiveIdeaIndex((prev) => (prev + 1) % relatedIdeas.length);
    }
  };

  const prevIdea = () => {
    if (relatedIdeas.length > 0) {
      setActiveIdeaIndex((prev) => (prev - 1 + relatedIdeas.length) % relatedIdeas.length);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center">
      <AnimatedBackground />
      
      <div className="container px-4 md:px-6 py-10 relative z-10 max-w-5xl mx-auto">
        <div className="flex items-center mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1" 
            onClick={() => navigate('/')}
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Search
          </Button>
        </div>

        {ideaData.tags && ideaData.tags.length > 0 && (
          <div className="w-full max-w-2xl mx-auto mb-4">
            <label htmlFor="tag-filter" className="block text-sm font-medium text-foreground mb-2">
              Filter by Tag
            </label>
            <Select value={selectedTag} onValueChange={handleTagSelect}>
              <SelectTrigger id="tag-filter" className="w-full">
                <SelectValue placeholder="Select a tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {availableTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        <ResultCard
          itemName={ideaData.itemName}
          materialType={ideaData.materialType}
          ideaTitle={ideaData.ideaTitle}
          suggestions={filteredSuggestions}
          howTo={ideaData.howTo}
          isGeneric={ideaData.isGeneric}
          timeRequired={ideaData.timeRequired}
          difficultyLevel={ideaData.difficultyLevel}
          tags={ideaData.tags}
          isDetailPage={true}
        />

        {showMoreIdeas && relatedIdeas.length > 0 && (
          <div className="mt-8 w-full max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">More ideas for {ideaData.itemName}</h2>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={prevIdea}
                  disabled={relatedIdeas.length <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={nextIdea}
                  disabled={relatedIdeas.length <= 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeIdeaIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ResultCard
                  itemName={ideaData.itemName}
                  materialType={ideaData.materialType}
                  ideaTitle={relatedIdeas[activeIdeaIndex].title}
                  suggestions={relatedIdeas[activeIdeaIndex].description}
                  howTo={relatedIdeas[activeIdeaIndex].instructions}
                  isGeneric={false}
                  timeRequired={relatedIdeas[activeIdeaIndex].timeRequired}
                  difficultyLevel={relatedIdeas[activeIdeaIndex].difficultyLevel}
                  tags={relatedIdeas[activeIdeaIndex].tags}
                  isDetailPage={false}
                  className="border-primary/30 shadow-md"
                />
              </motion.div>
            </AnimatePresence>
            
            {relatedIdeas.length > 1 && (
              <div className="flex justify-center mt-4">
                {relatedIdeas.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 mx-1 rounded-full ${
                      index === activeIdeaIndex ? 'bg-primary' : 'bg-muted'
                    }`}
                    onClick={() => setActiveIdeaIndex(index)}
                    aria-label={`View idea ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IdeaDetail;
