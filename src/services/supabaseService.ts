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
  similarItems?: {
    id: string;
    name: string;
    materialType: string;
  }[];
  relatedIdeas?: {
    id: string;
    title: string;
    description: string[];
    instructions: string;
    timeRequired: number | null;
    difficultyLevel: number | null;
    tags?: string[];
  }[];
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
    
    const uniqueTypes = [...new Set(data.map(item => item.material_type))];
    return uniqueTypes;
  } catch (error) {
    console.error('Error in getMaterialTypes:', error);
    return [];
  }
};

export const getItemsByMaterialType = async (materialType: string): Promise<RecyclingItem[]> => {
  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('material_type', materialType)
      .order('name');
    
    if (error) {
      console.error('Error fetching items by material type:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getItemsByMaterialType:', error);
    return [];
  }
};

export const searchRecyclingItems = async (query: string, materialType?: string): Promise<SearchResult | null> => {
  try {
    console.log("Searching for:", query, "Material type:", materialType);
    
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
    
    if (materialType) {
      itemsQuery = itemsQuery.eq('material_type', materialType);
    }
    
    const { data: exactMatches, error: exactError } = await itemsQuery;

    if (exactError) {
      console.error('Error fetching exact matches:', exactError);
      return null;
    }

    console.log("Exact matches:", exactMatches);

    if (exactMatches && exactMatches.length > 0) {
      const item = exactMatches[0];
      
      let mainIdea = null;
      const relatedIdeas = [];
      
      for (const matchedItem of exactMatches) {
        if (matchedItem.ideas && Array.isArray(matchedItem.ideas)) {
          for (const ideaRelation of matchedItem.ideas) {
            if (ideaRelation.ideas && typeof ideaRelation.ideas === 'object') {
              const idea = ideaRelation.ideas;
              
              if (idea && idea.id) {
                const tags: string[] = [];
                if (idea.tags && Array.isArray(idea.tags)) {
                  idea.tags.forEach(tagRelation => {
                    if (tagRelation.tags && typeof tagRelation.tags === 'object' && tagRelation.tags.name) {
                      tags.push(tagRelation.tags.name);
                    }
                  });
                }
                
                const processedIdea = {
                  id: idea.id,
                  title: idea.title,
                  description: idea.description.split('\n').filter(Boolean),
                  instructions: idea.instructions,
                  timeRequired: idea.time_required,
                  difficultyLevel: idea.difficulty_level,
                  tags: tags.length > 0 ? tags : undefined
                };
                
                if (!mainIdea) {
                  mainIdea = processedIdea;
                } else {
                  if (!relatedIdeas.some(ri => ri.id === idea.id)) {
                    relatedIdeas.push(processedIdea);
                  }
                }
              }
            }
          }
        }
      }
      
      if (mainIdea) {
        return {
          itemName: item.name,
          materialType: item.material_type,
          ideaTitle: mainIdea.title,
          suggestions: mainIdea.description,
          howTo: mainIdea.instructions,
          isGeneric: false,
          timeRequired: mainIdea.timeRequired,
          difficultyLevel: mainIdea.difficultyLevel,
          tags: mainIdea.tags,
          relatedIdeas: relatedIdeas,
          similarItems: exactMatches.map(match => ({
            id: match.id,
            name: match.name,
            materialType: match.material_type
          }))
        };
      }
      
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
        difficultyLevel: item.difficulty_level,
        similarItems: exactMatches.map(match => ({
          id: match.id,
          name: match.name,
          materialType: match.material_type
        }))
      };
    }

    let similarQuery = supabase
      .from('items')
      .select(`
        id, 
        name, 
        material_type,
        difficulty_level
      `);
    
    if (materialType) {
      similarQuery = similarQuery.eq('material_type', materialType);
    } else {
      similarQuery = similarQuery.ilike('material_type', `%${query}%`);
    }
    
    const { data: similarMatches, error: similarError } = await similarQuery.limit(5);

    if (similarError) {
      console.error('Error fetching similar matches:', similarError);
    }

    console.log("Similar matches by material:", similarMatches);

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
        isGeneric: true,
        similarItems: [
          {
            id: similarMatches[0].id,
            name: similarMatches[0].name,
            materialType: similarMatches[0].material_type
          }
        ]
      };
    }

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
