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
  materialType: string;
  ideaTitle: string | null;
  suggestions: string[];
  howTo: string;
  isGeneric: boolean;
  timeRequired?: number | null;
  difficultyLevel?: number | null;
  tags?: string[];
}

export const getMaterialTypes = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('items')
      .select('material_type')
      .order('material_type');
    
    if (error) {
      console.error('Error fetching material types:', error);
      return [];
    }
    
    // Extract unique material types
    const uniqueTypes = [...new Set(data.map(item => item.material_type))];
    return uniqueTypes;
  } catch (error) {
    console.error('Error in getMaterialTypes:', error);
    return [];
  }
};

export const searchRecyclingItems = async (query: string, materialType?: string): Promise<SearchResult | null> => {
  try {
    console.log("Searching for:", query, "Material type:", materialType);
    
    // Build query
    let itemsQuery = supabase
      .from('items')
      .select(`
        id, 
        name, 
        description, 
        material_type,
        difficulty_level,
        ideas:items_ideas(
          idea_id,
          ideas:idea_id(
            id,
            title,
            description,
            instructions,
            time_required,
            difficulty_level,
            tags:ideas_tags(
              tags:tag_id(
                name
              )
            )
          )
        )
      `)
      .ilike('name', `%${query}%`)
      .limit(1);
    
    // Add material type filter if provided
    if (materialType) {
      itemsQuery = itemsQuery.eq('material_type', materialType);
    }
    
    const { data: exactMatches, error: exactError } = await itemsQuery;

    if (exactError) {
      console.error('Error fetching exact matches:', exactError);
      return null;
    }

    console.log("Exact matches:", exactMatches);

    // If we have an exact match, return the related recycling ideas
    if (exactMatches && exactMatches.length > 0) {
      const item = exactMatches[0];
      
      // Check if there are any ideas associated with this item
      if (item.ideas && Array.isArray(item.ideas) && item.ideas.length > 0) {
        // Find the first idea with valid nested idea data
        for (const ideaRelation of item.ideas) {
          if (ideaRelation.ideas && typeof ideaRelation.ideas === 'object') {
            const idea = ideaRelation.ideas;
            console.log("Found idea:", idea);
            
            if (idea && idea.id) {
              // Extract tags if available
              const tags: string[] = [];
              if (idea.tags && Array.isArray(idea.tags)) {
                idea.tags.forEach(tagRelation => {
                  if (tagRelation.tags && typeof tagRelation.tags === 'object' && tagRelation.tags.name) {
                    tags.push(tagRelation.tags.name);
                  }
                });
              }
              
              return {
                itemName: item.name,
                materialType: item.material_type,
                ideaTitle: idea.title,
                suggestions: idea.description.split('\n').filter(Boolean),
                howTo: idea.instructions,
                isGeneric: false,
                timeRequired: idea.time_required,
                difficultyLevel: idea.difficulty_level,
                tags: tags.length > 0 ? tags : undefined
              };
            }
          }
        }
      }
      
      // If we found an item but no associated ideas, return item info with generic suggestions
      return {
        itemName: item.name,
        materialType: item.material_type,
        ideaTitle: null,
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
    let similarQuery = supabase
      .from('items')
      .select(`
        id, 
        name, 
        material_type,
        difficulty_level
      `);
    
    // If materialType is provided, use that for filtering
    if (materialType) {
      similarQuery = similarQuery.eq('material_type', materialType);
    } else {
      // Otherwise try to match by material type in query
      similarQuery = similarQuery.ilike('material_type', `%${query}%`);
    }
    
    const { data: similarMatches, error: similarError } = await similarQuery.limit(5);

    if (similarError) {
      console.error('Error fetching similar matches:', similarError);
    }

    console.log("Similar matches by material:", similarMatches);

    // If we found similar matches by material, show generic suggestions
    if (similarMatches && similarMatches.length > 0) {
      return {
        itemName: query,
        materialType: similarMatches[0].material_type,
        ideaTitle: null,
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
      materialType: "Unknown",
      ideaTitle: null,
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
