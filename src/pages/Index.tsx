
import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { recyclingDatabase, findBestMatch } from '@/utils/recyclingData';
import Header from '@/components/Header';
import SearchInput from '@/components/SearchInput';
import ResultCard from '@/components/ResultCard';
import AnimatedBackground from '@/components/AnimatedBackground';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const [searchResult, setSearchResult] = useState<{
    itemName: string;
    suggestions: string[];
    howTo: string;
    isGeneric: boolean;
  } | null>(null);
  
  const { toast } = useToast();

  const handleSearch = (query: string) => {
    const { match, score } = findBestMatch(query);
    
    if (match && (score > 0.5 || query === match)) {
      const data = recyclingDatabase[match];
      setSearchResult({
        itemName: match,
        suggestions: data.suggestions,
        howTo: data.howTo,
        isGeneric: false
      });
      
      toast({
        title: "Item found!",
        description: `Here are some recycling ideas for ${match}.`,
        duration: 3000,
      });
    } else {
      // Show generic suggestions
      setSearchResult({
        itemName: query,
        suggestions: [
          "Check if your local recycling center accepts this material",
          "Consider donating if the item is still in good condition",
          "Search online for DIY upcycling projects specific to your item",
          "For electronics, look for e-waste recycling programs in your area"
        ],
        howTo: "Always check with your local recycling guidelines to ensure proper disposal of items that cannot be repurposed.",
        isGeneric: true
      });
      
      toast({
        title: "No exact match found",
        description: "Here are some general recycling tips instead.",
        duration: 3000,
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center">
      <AnimatedBackground />
      
      <div className="container px-4 md:px-6 py-10 relative z-10 max-w-5xl mx-auto">
        <Header />
        
        <div className="mt-8 md:mt-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <SearchInput onSearch={handleSearch} />
        </div>
        
        <AnimatePresence mode="wait">
          {searchResult && (
            <ResultCard
              key={searchResult.itemName}
              itemName={searchResult.itemName}
              suggestions={searchResult.suggestions}
              howTo={searchResult.howTo}
              isGeneric={searchResult.isGeneric}
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
