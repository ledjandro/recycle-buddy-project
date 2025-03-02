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
  imageUrl?: string;
  isAiGenerated?: boolean;
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

export const generateRecyclingIdea = async (material?: string): Promise<SearchResult | null> => {
  try {
    const materialTypes = [
      "Plastic", "Paper", "Glass", "Metal", "Textile", "Electronic", 
      "Organic", "Wood", "Cardboard", "Rubber", "Composite"
    ];
    
    const materialType = material || materialTypes[Math.floor(Math.random() * materialTypes.length)];
    
    const itemNames: Record<string, string[]> = {
      "Plastic": ["Plastic Bottle", "Plastic Container", "Plastic Bag", "Plastic Toy", "Plastic Utensil"],
      "Paper": ["Newspaper", "Magazine", "Printer Paper", "Paper Bag", "Gift Wrap"],
      "Glass": ["Glass Bottle", "Glass Jar", "Glass Container", "Broken Glass", "Glass Cup"],
      "Metal": ["Aluminum Can", "Tin Can", "Metal Container", "Metal Lid", "Foil"],
      "Textile": ["Old T-shirt", "Jeans", "Bedsheet", "Curtain", "Towel"],
      "Electronic": ["Old Phone", "Computer Parts", "Cables", "Batteries", "Remote Controller"],
      "Organic": ["Food Scraps", "Coffee Grounds", "Eggshells", "Fruit Peels", "Yard Waste"],
      "Wood": ["Wood Scraps", "Pallet", "Wooden Furniture", "Wooden Toy", "Chopsticks"],
      "Cardboard": ["Cardboard Box", "Cereal Box", "Toilet Paper Roll", "Egg Carton", "Cardboard Tube"],
      "Rubber": ["Old Tire", "Rubber Band", "Flip Flops", "Rubber Gloves", "Rubber Mat"],
      "Composite": ["Tetra Pak", "Coffee Cup", "Chip Bag", "Toothpaste Tube", "Disposable Diaper"]
    };
    
    const items = itemNames[materialType] || ["Generic Item"];
    const randomItem = items[Math.floor(Math.random() * items.length)];
    
    const ideaTitles = [
      `Upcycled ${randomItem} Project`,
      `Creative Reuse for ${randomItem}`,
      `DIY ${randomItem} Transformation`,
      `Sustainable Craft with ${randomItem}`,
      `Eco-friendly ${randomItem} Makeover`
    ];
    
    const randomTitle = ideaTitles[Math.floor(Math.random() * ideaTitles.length)];
    
    const suggestionTemplates = [
      `Clean the ${randomItem} thoroughly before starting the project`,
      `Cut the ${randomItem} into smaller pieces for easier handling`,
      `Combine multiple ${randomItem}s for a larger project`,
      `Add paint or decoration to personalize your creation`,
      `Share your creation on social media to inspire others`,
      `Consider using eco-friendly adhesives or fasteners for assembly`,
      `Incorporate other recycled materials to enhance your project`,
      `Use heat (if appropriate for the material) to reshape or modify`,
      `Reinforce weak points with additional materials as needed`
    ];
    
    const shuffledSuggestions = [...suggestionTemplates].sort(() => 0.5 - Math.random());
    const selectedSuggestions = shuffledSuggestions.slice(0, Math.floor(Math.random() * 3) + 3);
    
    const instructions = [
      `Start by thoroughly cleaning the ${randomItem}. Remove any labels, residue, or contents.`,
      `Depending on your project, you might need to cut, shape, or modify the ${randomItem}.`,
      `Assemble the parts according to your design, using appropriate adhesives or fasteners.`,
      `Add finishing touches like paint, decoration, or functional elements.`,
      `Let everything dry completely before using your new creation.`
    ].join("\n\n");
    
    const difficulty = Math.floor(Math.random() * 5) + 1;
    const time = (Math.floor(Math.random() * 6) + 1) * 15;
    
    const possibleTags = ["DIY", "Upcycling", "Beginner", "Advanced", "Kids", "Home Decor", "Storage", "Garden", "Office", "Kitchen", "Crafts", "Functional", "Decorative", "Zero Waste", "Sustainable"];
    const shuffledTags = [...possibleTags].sort(() => 0.5 - Math.random());
    const selectedTags = shuffledTags.slice(0, Math.floor(Math.random() * 3) + 2);
    
    const imageCategories = [
      "upcycling", "recycling", "sustainable", "reuse", "craft", "diy", "eco"
    ];
    const randomCategory = imageCategories[Math.floor(Math.random() * imageCategories.length)];
    const imageUrl = `https://source.unsplash.com/random?${randomCategory},${materialType.toLowerCase()}`;
    
    return {
      itemName: randomItem,
      materialType: materialType,
      ideaTitle: randomTitle,
      suggestions: selectedSuggestions,
      howTo: instructions,
      isGeneric: false,
      timeRequired: time,
      difficultyLevel: difficulty,
      tags: selectedTags,
      isAiGenerated: true,
      imageUrl: imageUrl
    };
  } catch (error) {
    console.error('Error generating recycling idea:', error);
    return null;
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
        image_url,
        ideas:items_ideas(
          idea_id,
          ideas:idea_id(
            id,
            title,
            description,
            instructions,
            time_required,
            difficulty_level,
            cover_image_url,
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

    const aiIdeas = await generateMultipleAiIdeas(query, materialType, 6);

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
                  imageUrl: idea.cover_image_url,
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
        const result: SearchResult = {
          itemName: item.name,
          materialType: item.material_type,
          ideaTitle: mainIdea.title,
          suggestions: mainIdea.description,
          howTo: mainIdea.instructions,
          isGeneric: false,
          timeRequired: mainIdea.timeRequired,
          difficultyLevel: mainIdea.difficultyLevel,
          tags: mainIdea.tags,
          imageUrl: mainIdea.imageUrl || item.image_url || `https://source.unsplash.com/random?${item.material_type.toLowerCase()},${item.name.toLowerCase()}`,
          relatedIdeas: [
            ...relatedIdeas,
            ...aiIdeas.map(aiIdea => ({
              id: `ai-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              title: aiIdea.ideaTitle || '',
              description: aiIdea.suggestions,
              instructions: aiIdea.howTo,
              timeRequired: aiIdea.timeRequired || null,
              difficultyLevel: aiIdea.difficultyLevel || null,
              tags: aiIdea.tags,
              imageUrl: aiIdea.imageUrl,
              isAiGenerated: true
            }))
          ],
          similarItems: exactMatches.map(match => ({
            id: match.id,
            name: match.name,
            materialType: match.material_type
          }))
        };
        
        return result;
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
        imageUrl: item.image_url || `https://source.unsplash.com/random?${item.material_type.toLowerCase()},${item.name.toLowerCase()}`,
        relatedIdeas: aiIdeas.map(aiIdea => ({
          id: `ai-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          title: aiIdea.ideaTitle || '',
          description: aiIdea.suggestions,
          instructions: aiIdea.howTo,
          timeRequired: aiIdea.timeRequired || null,
          difficultyLevel: aiIdea.difficultyLevel || null,
          tags: aiIdea.tags,
          imageUrl: aiIdea.imageUrl,
          isAiGenerated: true
        })),
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
        difficulty_level,
        image_url
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
        imageUrl: similarMatches[0].image_url || `https://source.unsplash.com/random?${similarMatches[0].material_type.toLowerCase()},recycling`,
        relatedIdeas: aiIdeas.map(aiIdea => ({
          id: `ai-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          title: aiIdea.ideaTitle || '',
          description: aiIdea.suggestions,
          instructions: aiIdea.howTo,
          timeRequired: aiIdea.timeRequired || null,
          difficultyLevel: aiIdea.difficultyLevel || null,
          tags: aiIdea.tags,
          imageUrl: aiIdea.imageUrl,
          isAiGenerated: true
        })),
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
      isGeneric: true,
      imageUrl: `https://source.unsplash.com/random?recycling,${query.toLowerCase()}`,
      relatedIdeas: aiIdeas.map(aiIdea => ({
        id: `ai-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: aiIdea.ideaTitle || '',
        description: aiIdea.suggestions,
        instructions: aiIdea.howTo,
        timeRequired: aiIdea.timeRequired || null,
        difficultyLevel: aiIdea.difficultyLevel || null,
        tags: aiIdea.tags,
        imageUrl: aiIdea.imageUrl,
        isAiGenerated: true
      }))
    };
  } catch (error) {
    console.error('Error in searchRecyclingItems:', error);
    return null;
  }
};

const generateMultipleAiIdeas = async (
  query: string, 
  materialType?: string, 
  count: number = 6
): Promise<SearchResult[]> => {
  const ideas: SearchResult[] = [];
  
  let material = materialType;
  if (!material) {
    const materialTypes = [
      "Plastic", "Paper", "Glass", "Metal", "Textile", "Electronic", 
      "Organic", "Wood", "Cardboard", "Rubber", "Composite"
    ];
    
    material = materialTypes.find(m => query.toLowerCase().includes(m.toLowerCase()));
    
    if (!material) {
      material = materialTypes[Math.floor(Math.random() * materialTypes.length)];
    }
  }
  
  for (let i = 0; i < count; i++) {
    let itemName = query;
    
    const result = await generateRecyclingIdea(material);
    
    if (result) {
      result.itemName = itemName;
      
      if (!ideas.some(idea => idea.ideaTitle === result.ideaTitle)) {
        ideas.push(result);
      } else {
        i -= 1;
      }
    }
  }
  
  return ideas;
};
