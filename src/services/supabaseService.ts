
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

export const searchRecyclingItems = async (query: string, materialType?: string): Promise<SearchResult | null> => {
  try {
    // Search for similar items
    const { data: similarItems, error: searchError } = await supabase
      .from('items')
      .select('id, name, material_type')
      .ilike('name', `%${query}%`)
      .order('name');
    
    if (searchError) {
      console.error('Error searching for items:', searchError);
      return null;
    }
    
    // Try to find exact match first - using case insensitive exact match
    const { data: exactMatches, error: exactMatchError } = await supabase
      .from('items')
      .select('*')
      .ilike('name', query)
      .limit(1);
    
    if (exactMatchError) {
      console.error('Error finding exact match:', exactMatchError);
      return null;
    }
    
    // If we have an exact match, get related recycling ideas
    if (exactMatches && exactMatches.length > 0) {
      const item = exactMatches[0];
      
      // Get recycling ideas related to this item - in a real scenario, you would link ideas to items
      // For now we'll fetch random ideas and pretend they're related
      const { data: relatedIdeas, error: relatedIdeasError } = await supabase
        .from('ideas')
        .select('*')
        .limit(5);
      
      if (relatedIdeasError) {
        console.error('Error finding related ideas:', relatedIdeasError);
      }
      
      // If we don't have any real ideas from the database, generate some custom ones based on the item
      if (!relatedIdeas || relatedIdeas.length === 0) {
        const generatedResult = await generateRecyclingIdea(item.name, item.material_type);
        if (generatedResult) {
          return generatedResult;
        }
      }
      
      const formattedIdeas = relatedIdeas ? relatedIdeas.map(idea => ({
        id: idea.id,
        title: idea.title,
        description: idea.description.split('\n'),
        instructions: idea.instructions,
        timeRequired: idea.time_required,
        difficultyLevel: idea.difficulty_level
      })) : [];
      
      // Create a response with the exact match and related ideas
      return {
        itemName: item.name,
        materialType: item.material_type,
        ideaTitle: formattedIdeas.length > 0 ? formattedIdeas[0].title : null,
        suggestions: formattedIdeas.length > 0 && Array.isArray(formattedIdeas[0].description) 
          ? formattedIdeas[0].description 
          : [
              'Clean and prepare the item',
              'Gather necessary tools',
              'Follow eco-friendly disposal guidelines'
            ],
        howTo: formattedIdeas.length > 0 ? formattedIdeas[0].instructions : 
          'No specific instructions found. Consider general recycling guidelines.',
        isGeneric: false,
        timeRequired: formattedIdeas.length > 0 ? formattedIdeas[0].timeRequired : null,
        difficultyLevel: item.difficulty_level,
        imageUrl: item.image_url || undefined,
        similarItems: similarItems?.map(item => ({
          id: item.id,
          name: item.name,
          materialType: item.material_type
        })),
        relatedIdeas: formattedIdeas
      };
    }
    
    // No exact match, generate a custom idea for this item
    const generatedResult = await generateRecyclingIdea(query, materialType);
    if (generatedResult) {
      // Add similar items to the generated result
      generatedResult.similarItems = similarItems?.map(item => ({
        id: item.id,
        name: item.name,
        materialType: item.material_type
      }));
      return generatedResult;
    }
    
    // If generation failed, provide generic response
    return {
      itemName: query,
      materialType: materialType || "Unknown",
      ideaTitle: "General Recycling Tips",
      suggestions: [
        'Research local recycling guidelines',
        'Clean items thoroughly before recycling',
        'Separate different materials when possible',
        'Consider upcycling options before recycling'
      ],
      howTo: "Check with your local recycling center for specific guidelines on recycling this item. Different regions have different capabilities and requirements for recycling various materials.",
      isGeneric: true,
      similarItems: similarItems?.map(item => ({
        id: item.id,
        name: item.name,
        materialType: item.material_type
      }))
    };
  } catch (error) {
    console.error('Error in searchRecyclingItems:', error);
    return null;
  }
};

export const generateRecyclingIdea = async (itemName?: string, material?: string): Promise<SearchResult | null> => {
  try {
    const materialTypes = [
      "Plastic", "Paper", "Glass", "Metal", "Textile", "Electronic", 
      "Organic", "Wood", "Cardboard", "Rubber", "Composite"
    ];
    
    const materialType = material || materialTypes[Math.floor(Math.random() * materialTypes.length)];
    
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
    
    // Generate ideas specifically for this item
    const ideaOptions = getItemSpecificIdeas(itemToUse, materialType);
    
    // Make sure we always have unique titles for different items
    const itemNameLower = itemToUse.toLowerCase();
    const materialLower = materialType.toLowerCase();
    
    // Create unique titles based on the specific item
    const uniqueTitles = [
      `${itemToUse} Upcycling Project`,
      `Creative ${itemToUse} Reuse`,
      `DIY ${itemToUse} Transformation`,
      `Eco-friendly ${itemToUse} Craft`,
      `Sustainable ${itemToUse} Project`
    ];
    
    // Merge with any specific titles we have
    const ideaTitles = ideaOptions.titles.length > 0 
      ? ideaOptions.titles 
      : uniqueTitles;
    
    // Select a random title that's appropriate for this specific item
    const randomTitle = ideaTitles[Math.floor(Math.random() * ideaTitles.length)];
    
    // Generate item-specific suggestions
    const defaultSuggestions = [
      `Clean the ${itemToUse} thoroughly before starting`,
      `Measure and mark cutting lines if needed for your ${randomTitle.toLowerCase()}`,
      `Gather appropriate tools for working with ${materialType.toLowerCase()} materials`,
      `Consider safety precautions when handling ${materialType.toLowerCase()}`,
      `Prepare a workspace with good ventilation for this project`,
      `Research sustainable alternatives to disposal`,
      `Collect complementary materials that work well with ${materialType.toLowerCase()}`,
      `Plan your design before beginning the transformation`
    ];
    
    // Get specific or fallback suggestions
    const suggestionPool = ideaOptions.suggestions.length > 0 
      ? ideaOptions.suggestions 
      : defaultSuggestions;
    
    // Select a subset of the suggestions
    const shuffledSuggestions = [...suggestionPool].sort(() => 0.5 - Math.random());
    const selectedSuggestions = shuffledSuggestions.slice(0, Math.floor(Math.random() * 2) + 4); // 4-5 suggestions
    
    // Generate specific instructions based on the chosen title and item
    let instructions = generateRelevantInstructions(itemToUse, materialType, randomTitle);
    
    // Set reasonable difficulty and time values
    const difficulty = ideaOptions.difficultyLevel || Math.floor(Math.random() * 5) + 1;
    const time = ideaOptions.timeRequired || (Math.floor(Math.random() * 6) + 1) * 15;
    
    // Use specific tags or fallback with some customization based on the item
    const defaultTags = [
      "Upcycle", 
      `${materialType} Craft`, 
      "Sustainable", 
      "DIY Project", 
      `${materialType} Reuse`,
      "Eco-friendly"
    ];
    
    const possibleTags = ideaOptions.tags.length > 0 
      ? ideaOptions.tags 
      : defaultTags;
    
    const shuffledTags = [...possibleTags].sort(() => 0.5 - Math.random());
    const selectedTags = shuffledTags.slice(0, Math.floor(Math.random() * 3) + 2);
    
    // Set appropriate image search keywords
    const imageCategory = ideaOptions.imageKeywords || `${itemToUse.toLowerCase()} upcycle`;
    const imageUrl = `https://source.unsplash.com/random?${imageCategory},recycling`;
    
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

function generateRelevantInstructions(itemName: string, materialType: string, ideaTitle: string): string {
  const itemNameLower = itemName.toLowerCase();
  const titleLower = ideaTitle.toLowerCase();
  
  // Plastic Bag specific instructions
  if (itemNameLower.includes("plastic bag")) {
    if (titleLower.includes("tote") || titleLower.includes("reusable bag")) {
      return "Step 1: Collect 5-10 plastic bags of similar size and thickness.\nStep 2: Clean and dry the bags thoroughly to remove any residue.\nStep 3: Fold each bag neatly and cut off the handles and bottom seam.\nStep 4: Stack the bags and iron them between two sheets of parchment paper on low heat.\nStep 5: Once fused, cut the resulting material into a suitable pattern for a tote bag.\nStep 6: Fold and sew the sides to create your bag structure.\nStep 7: Add fabric or more plastic for sturdy handles.\nStep 8: Decorate with fabric paint or permanent markers if desired.\nStep 9: Your durable, waterproof tote is ready to replace future single-use bags.";
    }
    
    if (titleLower.includes("plarn") || titleLower.includes("crochet")) {
      return "Step 1: Collect 15-20 clean plastic bags for a small project.\nStep 2: Flatten each bag and cut off the handles and bottom seam.\nStep 3: Cut the remaining rectangle into 1-inch strips to create plastic yarn ('plarn').\nStep 4: Connect the strips by looping one through another and pulling tight.\nStep 5: Roll your plarn into a ball to make it easier to work with.\nStep 6: Use a large crochet hook (6mm or larger) to crochet your project.\nStep 7: For beginners, start with a simple stitch like single crochet.\nStep 8: Shape into a mat, basket, or even a durable shopping bag.\nStep 9: Finish off your project by securing the final stitch and tucking in loose ends.";
    }
    
    if (titleLower.includes("art") || titleLower.includes("decoration")) {
      return "Step 1: Collect plastic bags in various colors for an interesting palette.\nStep 2: Clean and dry all bags thoroughly.\nStep 3: Cut the bags into desired shapes - strips, circles, or other forms.\nStep 4: Prepare a base for your artwork, such as canvas or cardboard.\nStep 5: Arrange the plastic pieces into your design.\nStep 6: Secure pieces with non-toxic glue suitable for plastic materials.\nStep 7: Layer pieces to create dimension and visual interest.\nStep 8: Consider adding a protective coating to preserve your artwork.\nStep 9: Frame or mount your finished piece for display.";
    }
    
    if (titleLower.includes("stuffing") || titleLower.includes("pillow")) {
      return "Step 1: Collect 15-20 clean, dry plastic bags.\nStep 2: Tear or cut each bag into smaller pieces for better flexibility.\nStep 3: Choose a pillowcase or create one from upcycled fabric.\nStep 4: Stuff the fabric cover with the plastic bag pieces, distributing evenly.\nStep 5: Add more bags until you reach your desired firmness.\nStep 6: Sew the opening closed with a hidden stitch.\nStep 7: This pillow is waterproof and great for outdoor use.\nStep 8: For indoor pillows, consider adding a layer of fabric batting around the plastic for softness.\nStep 9: Your upcycled pillow is washable and will maintain its shape over time.";
    }
    
    if (titleLower.includes("waterproof") || titleLower.includes("protection")) {
      return "Step 1: Select several clean, intact plastic bags.\nStep 2: Cut open the bags to create flat plastic sheets.\nStep 3: Layer multiple sheets together for strength.\nStep 4: Iron between parchment paper on low heat to fuse them together.\nStep 5: Cut the fused plastic to the size needed for your waterproof covering.\nStep 6: For added durability, reinforce edges with duct tape or by sewing.\nStep 7: Create folded edges for a more finished look.\nStep 8: Add grommets to corners if you need to secure the covering.\nStep 9: Use your waterproof covering to protect outdoor items or as emergency rain protection.";
    }
    
    // General plastic bag project if no specific match
    return "Step 1: Clean and dry plastic bags thoroughly to remove any residue.\nStep 2: Cut the bags as needed for your specific project (removing handles and seams).\nStep 3: If fusing bags together, place between parchment paper and iron on low heat.\nStep 4: For weaving or crocheting, cut bags into strips to create plastic yarn ('plarn').\nStep 5: Shape your material according to your project design.\nStep 6: Join pieces using appropriate techniques: heat fusing, sewing, or tying.\nStep 7: Reinforce stress points for durability.\nStep 8: Add any decorative or functional elements to complete your project.\nStep 9: Your upcycled plastic bag creation reduces waste while creating something useful.";
  }
  
  // Plastic Bottle specific instructions
  if (itemNameLower.includes("plastic bottle")) {
    if (titleLower.includes("self-watering planter") || (titleLower.includes("planter") && !titleLower.includes("tower"))) {
      return "Step 1: Take a clean plastic bottle and remove all labels and adhesive.\nStep 2: Cut the bottle horizontally about 1/3 from the bottom using sharp scissors.\nStep 3: Drill or punch 3-4 small drainage holes in the bottom section.\nStep 4: Cut small notches around the top edge of the bottom section.\nStep 5: Take the top section and invert it, fitting it into the bottom section.\nStep 6: Thread a piece of cotton rope or fabric strip through the bottle cap to act as a wick.\nStep 7: Fill the top section with potting soil, leaving the wick extending into the soil.\nStep 8: Plant your seeds or small plants in the soil.\nStep 9: Fill the bottom reservoir with water and place in a sunny location.";
    }
    
    if (titleLower.includes("bird feeder")) {
      return "Step 1: Clean a plastic bottle thoroughly and remove the label.\nStep 2: Mark feeding hole locations about 1/3 up from the bottom, on opposite sides.\nStep 3: Cut small holes (1-2 inches diameter) at your marked spots using a sharp knife.\nStep 4: Drill or punch small drainage holes in the very bottom of the bottle.\nStep 5: Insert wooden dowels or spoons through the bottle just below the feeding holes to create perches.\nStep 6: Create a roof by cutting a circle from plastic or other waterproof material.\nStep 7: Attach the roof over the bottle cap using strong adhesive or wire.\nStep 8: Punch two small holes at the top and thread strong cord for hanging.\nStep 9: Fill with birdseed through the bottle opening and hang in a sheltered location.";
    }
    
    if (titleLower.includes("desk organizer")) {
      return "Step 1: Clean and dry several plastic bottles of various sizes.\nStep 2: Cut the bottles at different heights - some tall for pens, some shorter for paper clips.\nStep 3: Sand the cut edges to smooth any rough spots.\nStep 4: Arrange the cut bottles on a base made of cardboard or wood.\nStep 5: Mark their positions and use hot glue to secure them to the base.\nStep 6: Paint the entire organizer with plastic-specific spray paint.\nStep 7: Apply 2-3 thin coats, allowing drying time between each.\nStep 8: Optional: Add decorative washi tape or vinyl stickers for personality.\nStep 9: Allow to dry completely before adding your office supplies.";
    }
    
    if (titleLower.includes("wind spinner")) {
      return "Step 1: Clean a plastic bottle and remove all labels.\nStep 2: Draw a spiral pattern around the bottle from top to bottom.\nStep 3: Carefully cut along the spiral line using sharp scissors.\nStep 4: Gently pull the spiral to extend it vertically.\nStep 5: Punch a small hole at the top of the bottle neck.\nStep 6: Thread fishing line or string through the hole.\nStep 7: Decorate the spinner with weatherproof paint in bright colors.\nStep 8: Allow paint to dry completely.\nStep 9: Hang your spinner outdoors where it can catch the breeze.";
    }
    
    if (titleLower.includes("herb garden tower") || titleLower.includes("garden tower")) {
      return "Step 1: Collect 4-5 identical plastic bottles and clean thoroughly.\nStep 2: Cut the bottom off each bottle except for one (this will be the base).\nStep 3: Cut a large hole in each bottle cap, large enough for a plant to grow through.\nStep 4: Thread a strong dowel or PVC pipe through all bottle caps to create central support.\nStep 5: Screw the caps onto the bottles, assembling them in a stack.\nStep 6: Cut a 3-inch diameter hole in the side of each bottle for planting.\nStep 7: Fill the tower with potting soil through the top opening.\nStep 8: Plant herbs or small plants in each side opening.\nStep 9: Place in a sunny location and water from the top, allowing it to filter down.";
    }
    
    // General plastic bottle project instructions if no specific match
    return "Step 1: Clean your plastic bottle thoroughly and remove all labels.\nStep 2: Plan your design and mark cutting lines with a permanent marker.\nStep 3: Cut the bottle carefully using sharp scissors or a utility knife.\nStep 4: Sand any rough edges to prevent injury.\nStep 5: Assemble the cut pieces according to your project design.\nStep 6: Use hot glue or appropriate adhesive to secure connections.\nStep 7: Paint the exterior with plastic-specific paint if desired.\nStep 8: Allow to dry completely between coats.\nStep 9: Add any finishing touches or decorative elements to complete your project.";
  }
  
  // Glass Jar specific instructions
  if (itemNameLower.includes("glass jar") || itemNameLower.includes("mason jar")) {
    if (titleLower.includes("herb garden") || titleLower.includes("indoor garden")) {
      return "Step 1: Clean your mason jar thoroughly and allow to dry completely.\nStep 2: Using a diamond drill bit and water, carefully drill 3-4 drainage holes in the bottom.\nStep 3: Add a layer of small pebbles at the bottom for drainage (about 1 inch).\nStep 4: Optional: Add a small layer of activated charcoal to prevent mold.\nStep 5: Fill the jar about 3/4 full with potting soil formulated for herbs.\nStep 6: Plant your herb seeds or small seedlings according to package directions.\nStep 7: Water lightly until just moist, not soggy.\nStep 8: Place in a sunny windowsill that gets at least 6 hours of light.\nStep 9: Water when the top inch of soil feels dry to the touch.";
    }
    
    if (titleLower.includes("pendant light")) {
      return "Step 1: Thoroughly clean your mason jar and remove the lid (keep the rim).\nStep 2: Using a hammer and nail, carefully punch a hole in the center of the lid.\nStep 3: Thread your pendant light cord through this hole from inside the lid.\nStep 4: Secure the socket to the lid following the kit instructions.\nStep 5: Select a decorative Edison bulb that will fit inside the jar.\nStep 6: Screw the rim back onto the jar with the light assembly.\nStep 7: Test the light to ensure it works properly.\nStep 8: Hang your new pendant light using secure mounting hardware.\nStep 9: Adjust the cord length as needed for your space.";
    }
    
    if (titleLower.includes("bathroom organizer") || titleLower.includes("organizer")) {
      return "Step 1: Clean 3-4 mason jars and remove any labels.\nStep 2: If desired, paint the jars with glass paint or frosted spray.\nStep 3: Allow paint to dry completely (usually 24 hours).\nStep 4: Cut a piece of wood to serve as the mounting board.\nStep 5: Sand and stain or paint the wood as desired.\nStep 6: Attach pipe clamps or hose clamps to the board, spaced evenly.\nStep 7: Tighten the clamps around each jar, securing them to the board.\nStep 8: Mount the board to the wall using appropriate anchors and screws.\nStep 9: Fill jars with bathroom items like cotton balls, q-tips, and toothbrushes.";
    }
    
    // General glass jar project instructions if no specific match
    return "Step 1: Clean your glass jar thoroughly and remove all labels.\nStep 2: If painting, use glass-specific paint for best adhesion.\nStep 3: For cutting or drilling, use appropriate glass tools and safety equipment.\nStep 4: Prepare any embellishments or decorative elements.\nStep 5: Assemble your project according to your specific design.\nStep 6: Allow adequate drying time for any adhesives or paint.\nStep 7: Apply a sealer if the project will be exposed to moisture.\nStep 8: Add any hardware needed for hanging or displaying.\nStep 9: Allow the project to cure completely before using.";
  }
  
  // Paper specific instructions
  if (itemNameLower.includes("paper") || itemNameLower.includes("newspaper") || itemNameLower.includes("magazine")) {
    if (titleLower.includes("paper mache")) {
      return "Step 1: Tear your paper into small strips, about 1 inch wide and 3-4 inches long.\nStep 2: Prepare a paste by mixing equal parts flour and water until smooth.\nStep 3: Create a basic shape using crumpled newspaper, wire, or a balloon.\nStep 4: Dip paper strips into the paste, removing excess with your fingers.\nStep 5: Layer the wet strips over your base shape, overlapping slightly.\nStep 6: Build up 3-4 layers, allowing some drying time between layers.\nStep 7: Allow the creation to dry completely (usually 24-48 hours).\nStep 8: Once dry, paint with acrylic paint in your desired colors.\nStep 9: Finish with a clear sealer to protect and preserve your creation.";
    }
    
    if (titleLower.includes("basket") || titleLower.includes("container")) {
      return "Step 1: Collect several newspapers or magazines.\nStep 2: Fold each page lengthwise multiple times to create tight tubes.\nStep 3: For the base, arrange 8-10 tubes in a parallel pattern.\nStep 4: Weave perpendicular tubes through the base tubes to create a tight grid.\nStep 5: Bend the tubes upward 90 degrees to begin forming the sides.\nStep 6: Continue weaving additional tubes horizontally around the upright tubes.\nStep 7: Secure the ends by tucking them under adjacent tubes.\nStep 8: Trim any excess and fold down the top tubes to finish the rim.\nStep 9: Spray with paint and sealer for a more durable finish.";
    }
    
    if (titleLower.includes("origami") || titleLower.includes("fold")) {
      return "Step 1: Select a clean, square piece of paper (cut from magazine or newspaper if needed).\nStep 2: Follow basic origami folding techniques - valley folds and mountain folds.\nStep 3: Start with simple designs like boxes, boats, or animals.\nStep 4: Make precise creases by running your fingernail along each fold.\nStep 5: Follow your pattern step by step, checking alignment at each stage.\nStep 6: For complex designs, use lighter weight paper that holds creases well.\nStep 7: If using printed paper, consider which patterns will be visible in the final design.\nStep 8: Display your finished origami on a shelf or string multiple pieces for a mobile.\nStep 9: Once you've mastered basic forms, try combining multiple origami pieces into larger sculptures.";
    }
    
    if (titleLower.includes("bead") || titleLower.includes("jewelry")) {
      return "Step 1: Cut long triangular strips from colorful magazine pages.\nStep 2: Starting from the wide end, wrap the paper tightly around a skewer or toothpick.\nStep 3: Apply a small amount of glue to the final corner to secure the bead.\nStep 4: Slide the bead to the end of the skewer but don't remove it yet.\nStep 5: Apply a coat of clear nail polish or Mod Podge to seal the bead.\nStep 6: Allow to dry completely, then add a second coat for durability.\nStep 7: Once fully dry, remove beads from skewers.\nStep 8: String beads onto elastic cord, fishing line, or jewelry wire.\nStep 9: Add clasps or knots to complete your bracelet or necklace.";
    }
    
    // General paper project instructions if no specific match
    return "Step 1: Collect and sort your paper materials by color, thickness, and size.\nStep 2: Clean the paper by removing any staples, stickers, or adhesives.\nStep 3: Based on your project, cut or tear the paper into appropriate sizes.\nStep 4: For most paper crafts, a simple glue of flour and water works well.\nStep 5: Build your project in layers, allowing drying time as needed.\nStep 6: Reinforce stress points with additional layers of paper or tape.\nStep 7: Once assembled, allow your project to dry completely.\nStep 8: Decorate with paint, markers, or additional paper elements.\nStep 9: Apply a sealer appropriate for your project's intended use to protect it.";
  }
  
  // T-shirt specific instructions
  if (itemNameLower.includes("t-shirt") || itemNameLower.includes("shirt") || itemNameLower.includes("textile")) {
    if (titleLower.includes("market bag") || titleLower.includes("tote")) {
      return "Step 1: Start with a clean, unwanted t-shirt.\nStep 2: Lay it flat and cut off the sleeves along the seams.\nStep 3: Cut out the neckline, making the opening wider - this will be the top of your bag.\nStep 4: Turn the shirt inside out.\nStep 5: Using fabric scissors, cut fringe strips along the bottom of the shirt, about 3-4 inches long and 1 inch wide.\nStep 6: Tie each fringe strip to the one next to it using double knots, working your way across the entire bottom.\nStep 7: Once all strips are tied, turn the shirt right-side out.\nStep 8: Trim any uneven edges or loose threads.\nStep 9: Your market bag is ready to use for groceries, gym clothes, or beach essentials.";
    }
    
    if (titleLower.includes("quilt") || titleLower.includes("memory")) {
      return "Step 1: Collect 12-20 t-shirts with sentimental value or interesting designs.\nStep 2: Wash and iron all shirts before cutting.\nStep 3: Cut equal-sized squares from each shirt (typically 12-15 inches).\nStep 4: If the fabric is stretchy, apply lightweight fusible interfacing to the back.\nStep 5: Arrange the squares in a pleasing grid pattern.\nStep 6: Pin adjacent squares together and sew with a 1/2 inch seam allowance.\nStep 7: Sew rows together to complete the quilt top.\nStep 8: Add batting and backing fabric, then pin all layers together.\nStep 9: Quilt as desired either by hand, machine, or using the tie method with yarn at intersections.";
    }
    
    if (titleLower.includes("rug")) {
      return "Step 1: Collect 5-10 old t-shirts in coordinating colors.\nStep 2: Cut each shirt into continuous 1-inch strips, creating t-shirt yarn.\nStep 3: Stretch each strip to cause it to curl into a rope-like strand.\nStep 4: Join strips by cutting a small slit in the ends and looping them together.\nStep 5: Separate your t-shirt yarn into three equal bundles.\nStep 6: Tie the ends together and secure to a stable surface.\nStep 7: Braid the three bundles tightly and consistently.\nStep 8: Once your braid is long enough, begin coiling it into a spiral.\nStep 9: Use a large needle and strong thread to sew adjacent coils together as you work.";
    }
    
    // General t-shirt project instructions if no specific match
    return "Step 1: Wash and dry your t-shirt thoroughly before beginning.\nStep 2: Plan your design and create a paper pattern if needed.\nStep 3: Cut the shirt according to your pattern using sharp fabric scissors.\nStep 4: If sewing, pin pieces together before stitching.\nStep 5: Use an appropriate needle for knit fabrics if sewing by machine.\nStep 6: Reinforce seams that will receive stress or stretching.\nStep 7: Turn items right-side out if applicable and press seams.\nStep 8: Add any closures, decorative elements, or embellishments.\nStep 9: Give your creation a final press and trim any loose threads.";
  }
  
  // Generic fallback instructions based on material type
  const materialInstructions: Record<string, string> = {
    "Plastic": "Step 1: Clean your plastic item thoroughly with soap and water.\nStep 2: Remove any labels or adhesive using oil or alcohol.\nStep 3: Draw your design or cutting lines with a permanent marker.\nStep 4: Carefully cut the plastic using appropriate scissors or tools.\nStep 5: Sand any rough edges to prevent injuries.\nStep 6: Apply plastic primer if you plan to paint the item.\nStep 7: Paint with plastic-specific paints in thin, even coats.\nStep 8: Allow adequate drying time between coats.\nStep 9: Apply a clear sealant to protect your finished project.",
    
    "Paper": "Step 1: Sort your paper materials by thickness and size.\nStep 2: Remove any staples, clips, or non-paper elements.\nStep 3: Cut or tear paper to the required dimensions for your project.\nStep 4: Create a paste using 1 part flour to 1 part water if needed.\nStep 5: Layer or fold the paper according to your design.\nStep 6: Allow adequate drying time between steps.\nStep 7: Reinforce structural elements with additional layers.\nStep 8: Decorate with paint, markers, or additional paper elements.\nStep 9: Apply a sealer to protect your finished paper project.",
    
    "Glass": "Step 1: Clean the glass thoroughly with vinegar and water solution.\nStep 2: Plan your design and mark any cutting lines with a non-permanent marker.\nStep 3: Protect your work surface and wear safety glasses if cutting glass.\nStep 4: Apply glass paint, frosting spray, or etching cream as desired.\nStep 5: Allow proper drying or setting time according to product instructions.\nStep 6: Apply additional coats or colors as needed for your design.\nStep 7: Heat-set painted designs according to paint manufacturer instructions.\nStep 8: Add any embellishments like beads, wire, or decorative elements.\nStep 9: Apply a protective clear coat if recommended for your materials.",
    
    "Metal": "Step 1: Clean the metal surface thoroughly to remove dirt and oils.\nStep 2: Remove any rust using vinegar solution or commercial rust remover.\nStep 3: Sand the surface to create better adhesion for paint or finishes.\nStep 4: Apply a metal primer and allow to dry completely.\nStep 5: Paint with metal-specific paint in thin, even coats.\nStep 6: Create any desired patterns, holes, or bends in the metal.\nStep 7: Add decorative elements like beads, wire, or other materials.\nStep 8: Seal with a clear protective coating appropriate for your project's use.\nStep 9: Attach any hardware needed for hanging or displaying your creation.",
    
    "Textile": "Step 1: Wash and dry the fabric to remove any sizing or dirt.\nStep 2: Iron the fabric to remove wrinkles for easier cutting.\nStep 3: Create or trace a pattern onto the fabric with fabric markers.\nStep 4: Cut the fabric precisely using sharp fabric scissors.\nStep 5: Pin pieces together if you'll be sewing multiple sections.\nStep 6: Sew the pieces together using appropriate thread and needle.\nStep 7: Turn the project right-side out if applicable and press seams.\nStep 8: Add any closures, decorative elements, or embellishments.\nStep 9: Give your creation a final press and trim any loose threads."
  };
  
  // If we have a specific material instruction, use it, otherwise use the generic one
  return materialInstructions[materialType] || `Step 1: Clean the ${itemName} thoroughly before beginning.\nStep 2: Gather all necessary tools and materials for your project.\nStep 3: Measure and mark any cutting lines needed for your design.\nStep 4: Carefully cut or modify the item according to your plan.\nStep 5: Smooth any rough edges or surfaces as appropriate for the material.\nStep 6: Assemble the components of your ${ideaTitle}.\nStep 7: Secure parts together using appropriate adhesive or fasteners.\nStep 8: Apply paint, fabric, or decorative elements as desired.\nStep 9: Allow your project to dry completely before using.`;
}

function getItemSpecificIdeas(itemName: string, materialType: string) {
  const itemNameLower = itemName.toLowerCase();
  
  const defaultReturn = {
    titles: [],
    suggestions: [],
    instructions: "",
    tags: [],
    imageKeywords: "",
    difficultyLevel: null,
    timeRequired: null
  };
  
  // Plastic Bag specific ideas
  if (itemNameLower.includes("plastic bag")) {
    return {
      titles: [
        "Plastic Bag Tote Bag",
        "Plarn Crochet Basket",
        "Plastic Bag Waterproof Lining",
        "Plastic Bag Art Installation",
        "Fused Plastic Fabric Wallet",
        "Plastic Bag Pillow Stuffing",
        "Plastic Bag Waterproof Ground Cover",
        "Plastic Bag Woven Mat"
      ],
      suggestions: [
        "Collect clean, dry plastic bags of similar thickness",
        "Sort bags by color for more attractive projects",
        "For fusing plastic bags, use parchment paper and an iron on low heat",
        "When crocheting with plastic yarn ('plarn'), use a larger hook than normal",
        "Cut bags into continuous strips by spiral cutting for longer plarn strands",
        "Layer multiple bags for stronger, more durable material",
        "Practice folding techniques for compact storage of reusable bags",
        "For outdoor projects, choose sturdier, thicker plastic bags"
      ],
      instructions: "To create a Plarn Crochet Basket: Begin by collecting 15-20 clean plastic bags. Cut each bag into 1-inch continuous strips to create 'plarn' (plastic yarn). Join the strips by looping one through another and pulling tight. Use a large crochet hook (6mm or larger) and start with a magic circle of 6-8 single crochet stitches. Increase stitches in each round until reaching desired base size. Once the base is complete, crochet each round without increasing to form sides. Continue until reaching desired height, then finish off by securing the final stitch. Your durable, waterproof basket is perfect for storage in bathrooms, crafting areas, or gardens.",
      tags: ["Plastic Bag", "Upcycle", "No-Sew", "Waterproof", "Storage", "Crochet", "Plarn", "Eco-Friendly"],
      imageKeywords: "plastic+bag+crochet+basket",
      difficultyLevel: 3,
      timeRequired: 120
    };
  }
  
  // Mason Jar specific ideas
  else if (itemNameLower.includes("mason jar") || itemNameLower.includes("glass jar")) {
    return {
      titles: [
        "Mason Jar Indoor Herb Garden",
        "Mason Jar Hanging Wall Planter",
        "Mason Jar Bathroom Organizer Set",
        "Mason Jar Pendant Light",
        "Mason Jar Kitchen Utensil Holder",
        "Mason Jar Sewing Kit Organizer",
        "Layered Sand Art Mason Jar",
        "Mason Jar Terrarium Ecosystem"
      ],
      suggestions: [
        "Remove the metal lid from the jar, but keep the rim for some projects",
        "Spray paint the jar with frosted glass paint for a diffused light effect",
        "For the pendant light, use a lamp cord kit with an E26 socket that fits inside the jar opening",
        "Drill drainage holes in the bottom of the jar for plant-based projects using a diamond drill bit",
        "Secure multiple jars to a wooden plank for a bathroom organizer or wall planter",
        "Use copper wire to create hanging mechanisms for the jars",
        "Line the inside with contact paper for a decorative effect",
        "For kitchen organizers, group 3-4 jars together on a rotating base"
      ],
      instructions: "To create a Mason Jar Pendant Light: Start by thoroughly cleaning your mason jar and removing the lid (keep the rim). Using a hammer and nail, carefully punch a hole in the center of the lid. Thread your pendant light cord through this hole from inside the lid. Next, secure the socket to the lid following the kit instructions. Select a decorative Edison bulb that will fit inside the jar. Screw the rim back onto the jar with the light assembly. Finally, hang your new pendant light and adjust the cord length as needed. This makes an excellent light fixture for kitchen islands, dining areas, or bedside tables.",
      tags: ["Mason Jar", "Kitchen", "Lighting", "Home Decor", "Upcycle", "Farmhouse Style", "Functional"],
      imageKeywords: "mason+jar+pendant+light",
      difficultyLevel: 3,
      timeRequired: 45
    };
  }
  
  // Plastic Bottle specific ideas
  else if (itemNameLower.includes("plastic bottle")) {
    return {
      titles: [
        "Plastic Bottle Self-Watering Planter",
        "Plastic Bottle Bird Feeder Station",
        "Plastic Bottle Desk Organizer",
        "Plastic Bottle Wind Spinner",
        "Plastic Bottle Herb Garden Tower",
        "Plastic Bottle Drip Irrigation System",
        "Plastic Bottle Smartphone Amplifier",
        "Plastic Bottle Indoor Hydroponic Garden"
      ],
      suggestions: [
        "Cut the bottle horizontally to create two sections - the top will be inverted into the bottom section",
        "Use a heated nail to melt clean holes rather than cutting with scissors for cleaner results",
        "Add a wick made from cotton rope to connect the water reservoir and soil",
        "Paint with plastic-specific spray paint for better adhesion",
        "Group multiple bottles together for larger projects",
        "Add small rocks or marbles at the bottom for stability",
        "Use UV-resistant paint for outdoor projects",
        "Consider adding LED lights inside for illuminated night projects"
      ],
      instructions: "To create a Self-Watering Planter: Clean a plastic bottle thoroughly and remove labels. Cut the bottle horizontally about 1/3 from the bottom. Drill or punch 3-4 small drainage holes in the bottom section. Cut small notches around the top edge of the bottom section. Take the top section, remove the cap, and invert it into the bottom section. Thread a piece of cotton rope through the bottle neck to act as a wick. Fill the top section with potting soil, ensuring the wick extends into the soil. Plant your seeds or small plants. Fill the bottom reservoir with water and place in a sunny location. The wick will draw water up to the soil as needed.",
      tags: ["Plastic Upcycle", "Gardening", "Self-Watering", "Indoor Plants", "Eco-Friendly", "Sustainable", "DIY"],
      imageKeywords: "plastic+bottle+self+watering+planter",
      difficultyLevel: 2,
      timeRequired: 30
    };
  }
  
  // T-shirt specific ideas
  else if (itemNameLower.includes("t-shirt") || itemNameLower.includes("shirt")) {
    return {
      titles: [
        "No-Sew T-Shirt Tote Bag",
        "T-Shirt Memory Quilt",
        "T-Shirt Braided Rug",
        "T-Shirt Pillow Cover",
        "T-Shirt Dog Toy",
        "T-Shirt Wall Art",
        "T-Shirt Produce Bags",
        "T-Shirt Yarn Plant Hanger"
      ],
      suggestions: [
        "Choose t-shirts with meaningful designs or colors for memory projects",
        "Use fusible interfacing on stretchy shirts to make them easier to sew",
        "Cut t-shirts into continuous strips to create 't-shirt yarn' for crochet or braiding projects",
        "Save the neckbands and sleeves for smaller projects like bracelets or headbands",
        "Wash and dry all shirts before beginning your project to prevent shrinkage later",
        "Cut squares or rectangles with a cardboard template for consistent sizing",
        "Use a rotary cutter and mat for cleaner, straighter cuts",
        "For multi-shirt projects, organize by color for a cohesive design"
      ],
      instructions: "To create a No-Sew T-Shirt Tote Bag: Start with a clean t-shirt and lay it flat. Cut off the sleeves along the seams. Cut out the neckline, making the opening wider - this will be the top of your bag. Turn the shirt inside out. Using fabric scissors, cut fringe strips along the bottom of the shirt, about 3-4 inches long and 1 inch wide. Tie each fringe strip to the one next to it using double knots, working your way across the entire bottom. Once all strips are tied, turn the shirt right-side out. Your market bag is ready to use for groceries, gym clothes, or beach essentials.",
      tags: ["T-Shirt", "No-Sew", "Upcycle", "Tote Bag", "Quick Project", "Eco-Friendly", "Beginner Friendly"],
      imageKeywords: "tshirt+tote+bag+no+sew",
      difficultyLevel: 1,
      timeRequired: 15
    };
  }
  
  // Newspaper/Magazine specific ideas
  else if (itemNameLower.includes("newspaper") || itemNameLower.includes("magazine")) {
    return {
      titles: [
        "Newspaper Woven Basket",
        "Magazine Page Beads Jewelry",
        "Newspaper Seed Starter Pots",
        "Magazine Collage Wall Art",
        "Newspaper Paper Mache Bowl",
        "Magazine Page Gift Bags",
        "Newspaper Origami Decorations",
        "Magazine Page Coasters"
      ],
      suggestions: [
        "Roll newspapers tightly to create strong 'dowels' for weaving projects",
        "Look for colorful magazine pages for decorative projects",
        "Seal paper projects with Mod Podge or clear acrylic spray for durability",
        "For paper mache, tear paper into strips rather than cutting for better adhesion",
        "Make your own paste with flour and water instead of buying commercial adhesive",
        "Sort magazine pages by color for organized crafting",
        "For seed starter pots, use black and white newspaper (colored inks may contain toxins)",
        "Layer multiple pages for strength in structural projects"
      ],
      instructions: "To create Magazine Page Beads Jewelry: Cut long triangular strips from colorful magazine pages. Starting from the wide end, wrap the paper tightly around a skewer or toothpick. Apply a small amount of glue to the final corner to secure the bead. Slide the bead to the end of the skewer but don't remove it yet. Apply a coat of clear nail polish or Mod Podge to seal the bead. Allow to dry completely, then add a second coat for durability. Once fully dry, remove beads from skewers. String beads onto elastic cord, fishing line, or jewelry wire. Add clasps or knots to complete your bracelet or necklace.",
      tags: ["Paper Craft", "Magazine Upcycle", "Jewelry Making", "Colorful", "Low Cost", "Eco-Friendly", "Handmade Gifts"],
      imageKeywords: "magazine+paper+beads+jewelry",
      difficultyLevel: 2,
      timeRequired: 60
    };
  }
  
  return defaultReturn;
}
