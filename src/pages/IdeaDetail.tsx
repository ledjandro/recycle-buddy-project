
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
  const [allIdeas, setAllIdeas] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const ideasPerPage = 3; // Number of ideas to show per page
  
  useEffect(() => {
    // If no data was passed, this would be handled in the render
    if (!ideaData) return;
    
    // Set available tags from the idea data
    if (ideaData && ideaData.tags && ideaData.tags.length > 0) {
      setAvailableTags(ideaData.tags);
    }
    
    // Combine the main idea with related ideas into a single array
    const mainIdea = {
      title: ideaData.ideaTitle,
      description: ideaData.suggestions,
      instructions: ideaData.howTo,
      timeRequired: ideaData.timeRequired,
      difficultyLevel: ideaData.difficultyLevel,
      tags: ideaData.tags,
      isMainIdea: true
    };
    
    const combinedIdeas = [mainIdea];
    
    if (ideaData.relatedIdeas && ideaData.relatedIdeas.length > 0) {
      combinedIdeas.push(...ideaData.relatedIdeas);
    }
    
    setAllIdeas(combinedIdeas);
  }, [ideaData]);

  // If no data was passed, redirect back to home
  if (!ideaData) {
    return <Navigate to="/" replace />;
  }

  const handleTagSelect = (tag: string) => {
    setSelectedTag(tag);
    setCurrentPage(0); // Reset to first page when changing filters
  };

  // Filter ideas based on the selected tag
  const filteredIdeas = selectedTag === "all" 
    ? allIdeas 
    : allIdeas.filter(idea => 
        idea.tags && idea.tags.includes(selectedTag)
      );

  // Calculate pagination
  const totalPages = Math.ceil(filteredIdeas.length / ideasPerPage);
  const startIndex = currentPage * ideasPerPage;
  const visibleIdeas = filteredIdeas.slice(startIndex, startIndex + ideasPerPage);
  
  const nextPage = () => {
    setCurrentPage(prev => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage(prev => (prev - 1 + totalPages) % totalPages);
  };

  const goToPage = (pageIndex: number) => {
    setCurrentPage(pageIndex);
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

        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-center">
            Recycling Ideas for {ideaData.itemName}
          </h1>
          <p className="text-muted-foreground text-center mt-2">
            Material Type: {ideaData.materialType}
          </p>
        </div>

        {availableTags.length > 0 && (
          <div className="w-full max-w-2xl mx-auto mb-6">
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
        
        <div className="space-y-8">
          {filteredIdeas.length === 0 ? (
            <div className="text-center p-8 bg-muted rounded-lg">
              <p className="text-lg font-medium">No ideas found for the selected filter.</p>
              <Button 
                variant="outline" 
                onClick={() => setSelectedTag("all")} 
                className="mt-4"
              >
                Show All Ideas
              </Button>
            </div>
          ) : (
            <>
              {visibleIdeas.map((idea, index) => (
                <motion.div
                  key={`${idea.title}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <ResultCard
                    itemName={ideaData.itemName}
                    materialType={ideaData.materialType}
                    ideaTitle={idea.title}
                    suggestions={Array.isArray(idea.description) ? idea.description : [idea.description]}
                    howTo={idea.instructions}
                    isGeneric={false}
                    timeRequired={idea.timeRequired}
                    difficultyLevel={idea.difficultyLevel}
                    tags={idea.tags}
                    isDetailPage={false}
                    className={idea.isMainIdea ? "border-primary/50 shadow-md" : ""}
                  />
                </motion.div>
              ))}

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={prevPage}
                    disabled={totalPages <= 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  
                  <div className="flex justify-center space-x-2">
                    {Array.from({ length: totalPages }).map((_, index) => (
                      <button
                        key={index}
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          index === currentPage 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted hover:bg-muted-foreground/20'
                        }`}
                        onClick={() => goToPage(index)}
                        aria-label={`Go to page ${index + 1}`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={nextPage}
                    disabled={totalPages <= 1}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default IdeaDetail;
