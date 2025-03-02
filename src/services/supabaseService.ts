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

export const generateRecyclingIdea = async (itemName?: string, material?: string): Promise<SearchResult | null> => {
  try {
    const materialTypes = [
      "Plastic", "Paper", "Glass", "Metal", "Textile", "Electronic", 
      "Organic", "Wood", "Cardboard", "Rubber", "Composite"
    ];
    
    const materialType = material || materialTypes[Math.floor(Math.random() * materialTypes.length)];
    
    // If no specific item name provided, use generic items for that material
    let itemToUse = itemName || "";
    if (!itemToUse) {
      const itemNames: Record<string, string[]> = {
        "Plastic": ["Plastic Bottle", "Plastic Container", "Plastic Bag", "Plastic Toy", "Plastic Utensil"],
        "Paper": ["Newspaper", "Magazine", "Printer Paper", "Paper Bag", "Gift Wrap"],
        "Glass": ["Glass Bottle", "Glass Jar", "Mason Jar", "Glass Container", "Glass Cup"],
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
      itemToUse = items[Math.floor(Math.random() * items.length)];
    }
    
    // Generate ideas specific to the item
    const ideaOptions = getItemSpecificIdeas(itemToUse, materialType);
    
    // Select a random title from the available options or use a generic title pattern
    const ideaTitles = ideaOptions.titles.length > 0 
      ? ideaOptions.titles 
      : [
          `Upcycled ${itemToUse} Project`,
          `Creative Reuse for ${itemToUse}`,
          `DIY ${itemToUse} Transformation`,
          `Sustainable Craft with ${itemToUse}`,
          `Eco-friendly ${itemToUse} Makeover`
        ];
    
    const randomTitle = ideaTitles[Math.floor(Math.random() * ideaTitles.length)];
    
    // Use item-specific suggestions or fallback to generic ones
    const suggestionPool = ideaOptions.suggestions.length > 0 
      ? ideaOptions.suggestions 
      : [
          `Clean the ${itemToUse} thoroughly before starting the project`,
          `Consider decorating the ${itemToUse} with paint, ribbons, or other materials`,
          `Make sure to remove any labels or residue from the ${itemToUse}`,
          `Combine multiple ${itemToUse}s for a larger project`,
          `Share your creation on social media to inspire others`,
          `Consider using eco-friendly adhesives or fasteners for assembly`,
          `Incorporate other recycled materials to enhance your project`,
          `Use heat (if appropriate for the material) to reshape or modify`,
          `Reinforce weak points with additional materials as needed`
        ];
    
    // Shuffle and select 3-5 suggestions
    const shuffledSuggestions = [...suggestionPool].sort(() => 0.5 - Math.random());
    const selectedSuggestions = shuffledSuggestions.slice(0, Math.floor(Math.random() * 3) + 3);
    
    // Use item-specific instructions or fallback to generic ones
    const instructions = ideaOptions.instructions || 
      [
        `Start by thoroughly cleaning the ${itemToUse}. Remove any labels, residue, or contents.`,
        `Depending on your project, you might need to cut, shape, or modify the ${itemToUse}.`,
        `Assemble the parts according to your design, using appropriate adhesives or fasteners.`,
        `Add finishing touches like paint, decoration, or functional elements.`,
        `Let everything dry completely before using your new creation.`
      ].join("\n\n");
    
    const difficulty = Math.floor(Math.random() * 5) + 1;
    const time = (Math.floor(Math.random() * 6) + 1) * 15;
    
    // Use item-specific tags or fallback to generic ones
    const possibleTags = ideaOptions.tags.length > 0 
      ? ideaOptions.tags 
      : ["DIY", "Upcycling", "Beginner", "Advanced", "Kids", "Home Decor", "Storage", "Garden", "Office", "Kitchen", "Crafts", "Functional", "Decorative", "Zero Waste", "Sustainable"];
    
    const shuffledTags = [...possibleTags].sort(() => 0.5 - Math.random());
    const selectedTags = shuffledTags.slice(0, Math.floor(Math.random() * 3) + 2);
    
    // Create more specific image search keywords
    const imageCategory = ideaOptions.imageKeywords || itemToUse.toLowerCase();
    const imageUrl = `https://source.unsplash.com/random?${imageCategory},${materialType.toLowerCase()}`;
    
    return {
      itemName: itemToUse,
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

// Helper function to provide item-specific recycling ideas
function getItemSpecificIdeas(itemName: string, materialType: string) {
  const itemNameLower = itemName.toLowerCase();
  
  // Default return structure
  const defaultReturn = {
    titles: [],
    suggestions: [],
    instructions: "",
    tags: [],
    imageKeywords: ""
  };
  
  // Mason Jar specific ideas
  if (itemNameLower.includes("mason jar") || itemNameLower.includes("glass jar")) {
    return {
      titles: [
        "Mason Jar Herb Garden",
        "DIY Mason Jar Soap Dispenser",
        "Mason Jar Lighting Fixture",
        "Mason Jar Kitchen Storage Solution",
        "Mason Jar Terrarium",
        "Mason Jar Candle Holder",
        "Mason Jar Bathroom Organizer",
        "Mason Jar Table Centerpiece"
      ],
      suggestions: [
        "Clean the mason jar thoroughly and remove the label",
        "Paint the jar with glass paint for added decoration",
        "Use the jar's lid for additional design elements",
        "Group several mason jars together for a coordinated look",
        "Add fairy lights inside for a magical glow effect",
        "Use chalkboard paint to create labels on the jars",
        "Add hanging hardware to create hanging jar planters",
        "Fill the jar with layers of colored sand for decorative effect",
        "Use a glass drill bit to add drainage holes for plants",
        "Wrap twine or ribbon around the neck for a rustic touch"
      ],
      instructions: "Start by thoroughly cleaning your mason jar and removing any labels. If your project requires it, you can paint the jar with glass paint or spray paint designed for glass surfaces. For a planter, add a layer of small pebbles at the bottom for drainage, followed by activated charcoal to prevent mold, and then potting soil. When making a light fixture, be careful when adding electrical components - consider using battery-powered LED lights for safety. For storage solutions, add dividers or inserts as needed, and consider adding labels for organization.",
      tags: ["Mason Jar", "Glass Upcycle", "Home Decor", "Kitchen", "Garden", "Storage", "Gift Idea", "Rustic", "Farmhouse", "Zero Waste"],
      imageKeywords: "mason+jar,upcycle,craft"
    };
  }
  
  // Plastic Bottle specific ideas
  else if (itemNameLower.includes("plastic bottle")) {
    return {
      titles: [
        "Plastic Bottle Vertical Garden",
        "Bottle Bird Feeder",
        "Upcycled Bottle Planter",
        "DIY Plastic Bottle Piggy Bank",
        "Bottle Sprinkler System",
        "Recycled Bottle Lamp",
        "Self-Watering Planter from Bottles"
      ],
      suggestions: [
        "Cut the bottle horizontally or vertically depending on your project",
        "Use sandpaper to rough up surfaces that will be painted or glued",
        "Add drainage holes for plant-based projects",
        "Consider melting bottles (with proper ventilation) for artistic projects",
        "Collect multiple bottles of the same size for larger projects",
        "Remove labels completely for a cleaner look",
        "Use non-toxic, waterproof paint for outdoor projects"
      ],
      instructions: "Begin by thoroughly cleaning and drying your plastic bottle. Remove all labels and adhesive residue. For most projects, you'll need to cut the bottle - use sharp scissors or a craft knife, and always cut away from yourself. For planters, make sure to add drainage holes. When painting, use paints specifically designed for plastic, or rough up the surface first with sandpaper to help the paint adhere better. For outdoor projects, seal your finished creation with a waterproof sealant to extend its lifespan.",
      tags: ["Plastic Upcycle", "Garden", "Outdoor", "Kids Craft", "Functional", "Eco-friendly", "Water Conservation", "Budget Friendly"],
      imageKeywords: "plastic+bottle,upcycle,recycling"
    };
  }
  
  // Cardboard Box specific ideas
  else if (itemNameLower.includes("cardboard") || itemNameLower.includes("box")) {
    return {
      titles: [
        "Cardboard Box Storage Organizer",
        "DIY Cardboard Cat House",
        "Cardboard Children's Playhouse",
        "Upcycled Box Drawer Dividers",
        "Cardboard Wall Art",
        "Box Bookshelf Project",
        "Cardboard Gift Boxes"
      ],
      suggestions: [
        "Reinforce seams with strong tape or glue",
        "Cover with decorative paper or fabric for a finished look",
        "Use a ruler for straight cutting lines",
        "Double or triple layer cardboard for added strength",
        "Seal with mod podge or clear acrylic spray for durability",
        "Add dividers to create compartments",
        "Consider painting with acrylic paint for a solid finish"
      ],
      instructions: "Start with clean, sturdy cardboard. Plan your cuts carefully - measure twice, cut once! For most projects, you'll want to reinforce the corners and edges with strong tape or hot glue. To create a finished look, consider covering with decorative paper, fabric, or paint. Acrylic paint works well on cardboard, but you may need multiple coats for even coverage. For a more durable finish, seal your project with mod podge or a clear acrylic spray. If creating furniture or weight-bearing items, be sure to reinforce adequately and test weight limits before use.",
      tags: ["Cardboard", "Upcycle", "Home Organization", "Kids Project", "Pet Furniture", "Zero Waste", "Budget Friendly", "Storage Solution"],
      imageKeywords: "cardboard,upcycle,diy"
    };
  }
  
  // Add more item-specific ideas as needed for common searches
  
  // If no specific match, return defaults which will trigger the generic responses
  return defaultReturn;
}

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
    // Pass the query (item name) to the generator to create relevant ideas
    const result = await generateRecyclingIdea(query, material);
    
    if (result) {
      if (!ideas.some(idea => idea.ideaTitle === result.ideaTitle)) {
        ideas.push(result);
      } else {
        i -= 1; // Try again if we got a duplicate title
      }
    }
  }
  
  return ideas;
};
