
import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import ResultCard from '@/components/ResultCard';
import AnimatedBackground from '@/components/AnimatedBackground';
import { SearchResult } from '@/services/supabaseService';

const IdeaDetail = () => {
  const location = useLocation();
  const ideaData = location.state as SearchResult | null;

  // If no data was passed, redirect back to home
  if (!ideaData) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center">
      <AnimatedBackground />
      
      <div className="container px-4 md:px-6 py-10 relative z-10 max-w-5xl mx-auto">
        <ResultCard
          itemName={ideaData.itemName}
          materialType={ideaData.materialType}
          ideaTitle={ideaData.ideaTitle}
          suggestions={ideaData.suggestions}
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
