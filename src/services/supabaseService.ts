
import { supabase } from "@/integrations/supabase/client";

export interface RecyclingIdea {
  id: string;
  title: string;
  description: string;
  instructions: string;
  time_required: number | null;
  difficulty_level: number | null;
  cover_image_url: string | null;
  is_featured: boolean | null;
}

export interface RecyclingItem {
  id: string;
  name: string;
  description: string | null;
  material_type: string;
  difficulty_level: number | null;
  image_url: string | null;
}

export interface SearchResult {
  itemName: string;
  suggestions: string[];
  howTo: string;
  isGeneric: boolean;
  timeRequired?: number | null;
  difficultyLevel?: number | null;
  coverImageUrl?: string | null;
}

export const searchRecyclingItems = async (query: string): Promise<SearchResult | null> => {
  try {
    console.log("Searching for:", query);
    
    // First, try to find an exact match
    const { data: exactMatches, error: exactError } = await supabase
      .from('items')
      .select(`
        id, 
        name, 
        description, 
        material_type,
        difficulty_level,
        image_url,
        items_ideas(
          idea_id
        ),
        ideas:items_ideas(
          ideas(
            id,
            title,
            description,
            instructions,
            time_required,
            difficulty_level,
            cover_image_url
          )
        )
      `)
      .ilike('name', `%${query}%`)
      .limit(1);

    if (exactError) {
      console.error('Error fetching exact matches:', exactError);
      return null;
    }

    console.log("Exact matches:", exactMatches);

    // If we have an exact match, return the first recycling idea
    if (exactMatches && exactMatches.length > 0) {
      const item = exactMatches[0];
      
      // Check if there are any ideas associated with this item
      if (item.ideas && item.ideas.length > 0) {
        // Get the first idea with actual idea data
        const ideaData = item.ideas.find(i => i.ideas && i.ideas.length > 0);
        
        if (ideaData && ideaData.ideas && ideaData.ideas.length > 0) {
          const idea = ideaData.ideas[0];
          console.log("Found idea:", idea);
          
          return {
            itemName: item.name,
            suggestions: idea.description.split('\n').filter(Boolean),
            howTo: idea.instructions,
            isGeneric: false,
            timeRequired: idea.time_required,
            difficultyLevel: idea.difficulty_level,
            coverImageUrl: idea.cover_image_url
          };
        }
      }
      
      // If we found an item but no associated ideas, return item info with generic suggestions
      return {
        itemName: item.name,
        suggestions: [
          `Consider reusing this ${item.material_type} item for crafts or storage`,
          "Check if your local recycling center accepts this material",
          "Search online for specific upcycling ideas for this item"
        ],
        howTo: item.description || `This is a ${item.material_type} item that may be recyclable depending on your local facilities.`,
        isGeneric: true,
        difficultyLevel: item.difficulty_level
      };
    }

    // If no exact match, try to find a similar match by material type
    const { data: similarMatches, error: similarError } = await supabase
      .from('items')
      .select(`
        id, 
        name, 
        material_type,
        difficulty_level
      `)
      .ilike('material_type', `%${query}%`)
      .limit(5);

    if (similarError) {
      console.error('Error fetching similar matches:', similarError);
    }

    console.log("Similar matches by material:", similarMatches);

    // If we found similar matches by material, show generic suggestions
    if (similarMatches && similarMatches.length > 0) {
      return {
        itemName: query,
        suggestions: [
          `Check if your local recycling center accepts ${similarMatches[0].material_type}`,
          "Consider donating if the item is still in good condition",
          `Search online for DIY upcycling projects for ${similarMatches[0].material_type} items`,
          "Look for specialized recycling programs in your area"
        ],
        howTo: `${similarMatches[0].material_type} materials can often be recycled, but may require special handling. Always follow your local recycling guidelines for proper disposal.`,
        isGeneric: true
      };
    }

    // If no matches at all, return generic tips
    return {
      itemName: query,
      suggestions: [
        "Check if your local recycling center accepts this material",
        "Consider donating if the item is still in good condition",
        "Search online for DIY upcycling projects specific to your item",
        "For electronics, look for e-waste recycling programs in your area"
      ],
      howTo: "Always check with your local recycling guidelines to ensure proper disposal of items that cannot be repurposed.",
      isGeneric: true
    };
  } catch (error) {
    console.error('Error in searchRecyclingItems:', error);
    return null;
  }
};
