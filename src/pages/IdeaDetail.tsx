
import React, { useState, useEffect } from 'react';
import { useLocation, Navigate, useNavigate } from 'react-router-dom';
import ResultCard from '@/components/ResultCard';
import AnimatedBackground from '@/components/AnimatedBackground';
import { SearchResult } from '@/services/supabaseService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

const IdeaDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const ideaData = location.state as SearchResult | null;
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  useEffect(() => {
    // Set available tags from the idea data
    if (ideaData && ideaData.tags && ideaData.tags.length > 0) {
      setAvailableTags(ideaData.tags);
    }
    
    // Initialize filtered suggestions with all suggestions
    if (ideaData) {
      setFilteredSuggestions(ideaData.suggestions);
    }
  }, [ideaData]);

  // If no data was passed, redirect back to home
  if (!ideaData) {
    return <Navigate to="/" replace />;
  }

  const handleTagSelect = (tag: string) => {
    setSelectedTag(tag);
    
    // If no tag is selected (showing all), reset to all suggestions
    if (!tag) {
      setFilteredSuggestions(ideaData.suggestions);
      return;
    }
    
    // This is a placeholder for tag filtering logic
    // In a real app, you would have tag-specific suggestions in your data model
    // For now, we just pretend to filter based on the selected tag
    const tagRelatedSuggestions = ideaData.suggestions.filter(
      (_, index) => index % 2 === (tag === availableTags[0] ? 0 : 1)
    );
    
    setFilteredSuggestions(tagRelatedSuggestions.length > 0 
      ? tagRelatedSuggestions 
      : ideaData.suggestions
    );
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
                <SelectItem value="">All Tags</SelectItem>
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
      </div>
    </div>
  );
};

export default IdeaDetail;
