
import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import SearchInput from '@/components/SearchInput';
import ResultCard from '@/components/ResultCard';
import AnimatedBackground from '@/components/AnimatedBackground';
import { useToast } from '@/components/ui/use-toast';
import { searchRecyclingItems, SearchResult } from '@/services/supabaseService';

const Index = () => {
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setLoading(true);
    
    try {
      const result = await searchRecyclingItems(query);
      
      if (result) {
        setSearchResult(result);
        
        toast({
          title: result.isGeneric ? "No exact match found" : "Item found!",
          description: result.isGeneric 
            ? "Here are some general recycling tips instead." 
            : `Here are some recycling ideas for ${result.itemName}.`,
          duration: 3000,
        });
      } else {
        // Handle case where no result is returned
        toast({
          title: "Search error",
          description: "We couldn't process your search. Please try again.",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center">
      <AnimatedBackground />
      
      <div className="container px-4 md:px-6 py-10 relative z-10 max-w-5xl mx-auto">
        <Header />
        
        <div className="mt-8 md:mt-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <SearchInput onSearch={handleSearch} isLoading={loading} />
        </div>
        
        <AnimatePresence mode="wait">
          {searchResult && (
            <ResultCard
              key={searchResult.itemName}
              itemName={searchResult.itemName}
              materialType={searchResult.materialType}
              ideaTitle={searchResult.ideaTitle}
              suggestions={searchResult.suggestions}
              howTo={searchResult.howTo}
              isGeneric={searchResult.isGeneric}
              timeRequired={searchResult.timeRequired}
              difficultyLevel={searchResult.difficultyLevel}
              tags={searchResult.tags}
            />
          )}
        </AnimatePresence>
        
        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>Helping you recycle and repurpose one item at a time.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
