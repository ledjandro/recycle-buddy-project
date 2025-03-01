
import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import SearchInput from '@/components/SearchInput';
import AnimatedBackground from '@/components/AnimatedBackground';
import { useToast } from '@/components/ui/use-toast';
import { searchRecyclingItems, SearchResult, getMaterialTypes } from '@/services/supabaseService';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Index = () => {
  const [materialTypes, setMaterialTypes] = useState<string[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Load material types when component mounts
    const loadMaterialTypes = async () => {
      try {
        const types = await getMaterialTypes();
        setMaterialTypes(types);
      } catch (error) {
        console.error("Error loading material types:", error);
      }
    };
    
    loadMaterialTypes();
  }, []);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setLoading(true);
    
    try {
      // If material type is selected, use it in the search
      const materialFilter = selectedMaterial !== "all" ? selectedMaterial : undefined;
      const result = await searchRecyclingItems(query, materialFilter);
      
      if (result) {
        // Navigate to the detail page with the search result
        navigate(`/ideas/${encodeURIComponent(result.itemName)}`, { 
          state: result 
        });
        
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

  const handleMaterialSelect = (value: string) => {
    setSelectedMaterial(value);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center">
      <AnimatedBackground />
      
      <div className="container px-4 md:px-6 py-10 relative z-10 max-w-5xl mx-auto">
        <Header />
        
        <div className="mt-8 md:mt-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex flex-col space-y-4">
            <div className="w-full max-w-2xl mx-auto">
              <label htmlFor="material-filter" className="block text-sm font-medium text-foreground mb-2">
                Filter by Material Type (Optional)
              </label>
              <Select value={selectedMaterial} onValueChange={handleMaterialSelect}>
                <SelectTrigger id="material-filter" className="w-full">
                  <SelectValue placeholder="Select a material type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Materials</SelectItem>
                  {materialTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <SearchInput onSearch={handleSearch} isLoading={loading} />
          </div>
        </div>
        
        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>Helping you recycle and repurpose one item at a time.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
