
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
    
    // Use a specific title from the options or generate a relevant fallback
    const ideaTitles = ideaOptions.titles.length > 0 
      ? ideaOptions.titles 
      : [
          `${itemToUse} Lamp`,
          `${itemToUse} Storage Container`,
          `${itemToUse} Wall Organizer`,
          `${itemToUse} Planter Box`,
          `${itemToUse} Desk Organizer`
        ];
    
    const randomTitle = ideaTitles[Math.floor(Math.random() * ideaTitles.length)];
    
    // Get specific or fallback suggestions
    const suggestionPool = ideaOptions.suggestions.length > 0 
      ? ideaOptions.suggestions 
      : [
          `Clean the ${itemToUse} thoroughly before starting`,
          `Measure and mark cutting lines for your ${randomTitle.toLowerCase()}`,
          `Carefully cut the ${itemToUse} using appropriate tools for ${materialType.toLowerCase()}`,
          `Sand rough edges to prevent injuries`,
          `Apply a primer suitable for ${materialType.toLowerCase()} before painting`,
          `Use a weatherproof sealant for outdoor projects`,
          `Add rubber feet to the bottom to prevent scratching surfaces`,
          `Install LED lights for illuminated projects`,
          `Add decorative elements that complement your ${randomTitle.toLowerCase()}`
        ];
    
    // Select a subset of the suggestions
    const shuffledSuggestions = [...suggestionPool].sort(() => 0.5 - Math.random());
    const selectedSuggestions = shuffledSuggestions.slice(0, Math.floor(Math.random() * 3) + 3);
    
    // Generate specific instructions based on the chosen title and item
    let instructions = ideaOptions.instructions;
    
    // If no specific instructions, generate based on the selected title
    if (!instructions) {
      instructions = generateSpecificInstructions(itemToUse, materialType, randomTitle);
    }
    
    // Set reasonable difficulty and time values
    const difficulty = ideaOptions.difficultyLevel || Math.floor(Math.random() * 5) + 1;
    const time = ideaOptions.timeRequired || (Math.floor(Math.random() * 6) + 1) * 15;
    
    // Use specific tags or fallback
    const possibleTags = ideaOptions.tags.length > 0 
      ? ideaOptions.tags 
      : ["Upcycle", "Home Decor", "Functional", "Storage", "Gardening", "Organization", "DIY", "Eco-friendly"];
    
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

// Helper function to generate specific instructions based on the selected title
function generateSpecificInstructions(itemName: string, materialType: string, ideaTitle: string): string {
  const titleLower = ideaTitle.toLowerCase();
  
  // For lamp projects
  if (titleLower.includes("lamp") || titleLower.includes("light") || titleLower.includes("lantern")) {
    return `Step 1: Clean ${itemName} thoroughly and remove any labels.\nStep 2: Mark where you'll cut to create the lamp shape.\nStep 3: Carefully cut the ${itemName} using tools appropriate for ${materialType}.\nStep 4: Sand any rough edges for safety.\nStep 5: Drill a hole for the cord if needed.\nStep 6: Install a socket kit with cord according to manufacturer's instructions.\nStep 7: Add decorative elements to the exterior of your lamp.\nStep 8: Install an appropriate bulb for your lamp size.\nStep 9: Test the lamp to ensure it works properly and safely.`;
  }
  
  // For planter projects
  if (titleLower.includes("planter") || titleLower.includes("garden") || titleLower.includes("pot")) {
    return `Step 1: Clean ${itemName} thoroughly.\nStep 2: Drill or punch drainage holes in the bottom.\nStep 3: Add a layer of gravel or pebbles at the bottom for drainage.\nStep 4: Decorate the exterior with paint suitable for ${materialType}.\nStep 5: Allow paint to dry completely.\nStep 6: Add potting soil leaving room at the top.\nStep 7: Plant your chosen seeds or small plants.\nStep 8: Water lightly and place in appropriate sunlight.\nStep 9: Check soil moisture regularly and maintain as needed.`;
  }
  
  // For storage/organizer projects
  if (titleLower.includes("storage") || titleLower.includes("organizer") || titleLower.includes("holder") || titleLower.includes("container")) {
    return `Step 1: Clean ${itemName} thoroughly and remove any labels.\nStep 2: Mark where you'll cut or modify the ${itemName}.\nStep 3: Cut or shape as needed for your organizer design.\nStep 4: Sand any rough edges for safety.\nStep 5: Create dividers if needed for organization.\nStep 6: Paint or decorate the exterior to match your décor.\nStep 7: Add labels if needed for easy identification.\nStep 8: Apply a protective clear coat for durability.\nStep 9: Install in your desired location and fill with items.`;
  }
  
  // For wall décor projects
  if (titleLower.includes("wall") || titleLower.includes("art") || titleLower.includes("décor") || titleLower.includes("decor") || titleLower.includes("frame")) {
    return `Step 1: Clean ${itemName} thoroughly.\nStep 2: Sketch your design on paper first.\nStep 3: Mark cutting or assembly lines on the ${itemName}.\nStep 4: Cut or shape as needed using appropriate tools.\nStep 5: Sand rough edges for safety and appearance.\nStep 6: Paint or decorate according to your design plan.\nStep 7: Add hanging hardware to the back.\nStep 8: Apply a protective clear coat if needed.\nStep 9: Hang securely on your wall at the desired height.`;
  }
  
  // For furniture projects
  if (titleLower.includes("table") || titleLower.includes("chair") || titleLower.includes("bench") || titleLower.includes("stool") || titleLower.includes("furniture")) {
    return `Step 1: Clean ${itemName} thoroughly.\nStep 2: Create a design plan with measurements.\nStep 3: Cut or shape the ${itemName} as needed.\nStep 4: Sand all surfaces thoroughly for safety.\nStep 5: Join pieces together using appropriate fasteners or adhesives.\nStep 6: Reinforce joints for stability.\nStep 7: Apply paint, stain, or sealant suitable for ${materialType}.\nStep 8: Allow to dry completely between coats.\nStep 9: Add any finishing touches like felt pads on the bottom.`;
  }
  
  // Default instructions if none of the above categories match
  return `Step 1: Clean ${itemName} thoroughly before starting.\nStep 2: Sketch your design for the ${ideaTitle} on paper.\nStep 3: Gather all necessary tools and materials.\nStep 4: Mark any cutting lines on the ${itemName}.\nStep 5: Carefully cut or modify the ${itemName} according to your design.\nStep 6: Sand any rough edges for safety and appearance.\nStep 7: Paint or decorate as desired with materials suitable for ${materialType}.\nStep 8: Allow to dry completely.\nStep 9: Add any final details or functional elements to complete your project.`;
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
  
  if (itemNameLower.includes("mason jar") || itemNameLower.includes("glass jar")) {
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
      instructions: "Step 1: Thoroughly clean your mason jar and remove the lid (keep the rim).\nStep 2: Using a hammer and nail, carefully punch a hole in the center of the lid.\nStep 3: Thread your pendant light cord through this hole from inside the lid.\nStep 4: Secure the socket to the lid following the kit instructions.\nStep 5: Select a decorative Edison bulb that will fit inside the jar.\nStep 6: Screw the rim back onto the jar with the light assembly.\nStep 7: Test the light to ensure it works properly.\nStep 8: Hang your new pendant light using secure mounting hardware.\nStep 9: Adjust the cord length as needed for your space.",
      tags: ["Mason Jar", "Kitchen", "Lighting", "Home Decor", "Upcycle", "Farmhouse Style", "Functional"],
      imageKeywords: "mason+jar+pendant+light",
      difficultyLevel: 3,
      timeRequired: 45
    };
  }
  
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
        "Add a wick made of cotton rope between the water reservoir and the soil",
        "For multi-bottle projects, use zip ties or hot glue to connect bottles securely",
        "Cover the exterior with rope wrapping for a natural look",
        "Use biodegradable paint for outdoor projects to minimize environmental impact",
        "For the hydroponic system, create holes for net pots in the bottle sides",
        "For the organizer, cut bottles at varying heights to hold different items"
      ],
      instructions: "Step 1: Take a clean plastic bottle and cut it horizontally about 1/3 from the bottom.\nStep 2: This bottom section will be your water reservoir.\nStep 3: Take the top section and invert it so the bottle neck points downward.\nStep 4: Insert a piece of cotton rope through the bottle neck to serve as a wick.\nStep 5: Fill the inverted top section with potting soil, ensuring the wick extends up into the soil.\nStep 6: Plant your seedling or seeds in the soil.\nStep 7: Fill the bottom reservoir with water.\nStep 8: Place the soil-filled top section into the bottom reservoir, with the wick extending into the water.\nStep 9: As the soil dries out, it will draw water up through the wick, keeping your plants watered for days.",
      tags: ["Gardening", "Self-Watering", "Indoor Plants", "Plastic Upcycle", "Sustainable", "Hydroponic", "Zero Waste"],
      imageKeywords: "plastic+bottle+self+watering+planter",
      difficultyLevel: 2,
      timeRequired: 30
    };
  }
  
  else if (itemNameLower.includes("glass bottle")) {
    return {
      titles: [
        "Glass Bottle Tiki Torch",
        "Bottle Fairy Light Lamp",
        "Wine Bottle Herb Garden",
        "Glass Bottle Soap Dispenser",
        "Bottle Terrarium Garden",
        "Layered Sand Art Bottle",
        "Glass Bottle Bird Feeder",
        "Bottle Hanging Planter"
      ],
      suggestions: [
        "Use a bottle cutting kit to cleanly cut glass bottles for certain projects",
        "Add copper or LED string lights inside bottles for beautiful lighting effects",
        "For outdoor projects, use weather-resistant materials and sealants",
        "Consider etching designs onto the glass surface with etching cream",
        "Use wine bottles with interesting shapes or colors for more decorative projects",
        "Add a pour spout for bottles repurposed as oil or soap dispensers",
        "For terrariums, layer activated charcoal, soil, and decorative stones",
        "Use a glass drill bit with water to safely drill drainage holes"
      ],
      instructions: "Step 1: Clean your glass bottle thoroughly and remove all labels.\nStep 2: For the Fairy Light Lamp, ensure the bottle is completely dry inside.\nStep 3: Insert a string of 20-30 LED fairy lights into the bottle.\nStep 4: Arrange the cord so it exits the bottle mouth neatly.\nStep 5: Secure the battery pack discreetly near the bottle base or hide it.\nStep 6: Optionally, add decorative elements like sea glass or colored stones in the bottom.\nStep 7: Place in your desired location and adjust the light arrangement inside.\nStep 8: For an extra touch, wrap copper wire around the bottle neck as decoration.\nStep 9: Turn on the lights and enjoy your upcycled bottle lamp.",
      tags: ["Glass Upcycle", "Lighting", "Home Decor", "Sustainable", "Bottle Craft", "Mood Lighting", "Gift Idea"],
      imageKeywords: "glass+bottle+fairy+lights",
      difficultyLevel: 1,
      timeRequired: 20
    };
  }
  
  else if (itemNameLower.includes("cardboard") || itemNameLower.includes("box")) {
    return {
      titles: [
        "Cardboard Roll-Top Desk Organizer",
        "Multi-Compartment Shoe Storage System",
        "Cardboard Cable Management Station",
        "Cardboard Floating Wall Shelves",
        "Cardboard Bedside Caddy",
        "Honeycomb Modular Storage Unit",
        "Cardboard Under-Bed Rolling Storage",
        "Cardboard Drawer Divider System"
      ],
      suggestions: [
        "Use packing tape to reinforce all folds and corners for durability",
        "Apply several thin coats of acrylic paint instead of one thick coat to prevent warping",
        "Add drawer pulls made from wine corks, wooden beads, or cabinet knobs",
        "Create a template before cutting to ensure precise, matching pieces",
        "Use wood glue rather than white glue for stronger bonds between cardboard pieces",
        "Apply a clear polyurethane spray to seal and waterproof the finished product",
        "Add caster wheels to the bottom of storage units for mobility",
        "Line the inside with decorative paper or fabric for a finished look"
      ],
      instructions: "Step 1: Collect 6-8 same-sized cardboard boxes (shipping boxes work well).\nStep 2: Cut off the top and bottom flaps from each box.\nStep 3: Measure and mark 2-inch tabs along each open edge.\nStep 4: Score and fold these tabs inward.\nStep 5: Apply wood glue to the tabs and connect the boxes in a honeycomb pattern.\nStep 6: Reinforce all connections with packing tape on the inside.\nStep 7: Apply primer to the entire unit, then paint with your choice of colors.\nStep 8: Once dry, apply 2-3 coats of clear polyurethane spray for durability.\nStep 9: Mount to the wall using L-brackets, or leave freestanding.",
      tags: ["Organization", "Home Storage", "Cardboard Furniture", "DIY", "Eco-friendly", "Modular", "Wall Mount"],
      imageKeywords: "honeycomb+cardboard+shelf",
      difficultyLevel: 4,
      timeRequired: 120
    };
  }
  
  else if (itemNameLower.includes("t-shirt") || itemNameLower.includes("shirt") || itemNameLower.includes("textile")) {
    return {
      titles: [
        "No-Sew T-shirt Market Bag",
        "T-shirt Memory Quilt",
        "Braided T-shirt Rug",
        "T-shirt Yarn Plant Hanger",
        "T-shirt Pillow Cover Set",
        "T-shirt Produce Bags",
        "Knotted T-shirt Wall Hanging",
        "T-shirt Dog Toy Collection"
      ],
      suggestions: [
        "Use sharp fabric scissors for clean cuts without stretching the material",
        "For t-shirt yarn projects, cut shirts into continuous spirals to maximize length",
        "Pre-wash all shirts before starting to prevent shrinkage later",
        "Use iron-on interfacing on the back of special shirts for quilting to preserve prints",
        "Tie tight square knots for no-sew projects to prevent unraveling",
        "Use matching color threads when sewing to make seams less visible",
        "Reinforce handles on bags with double stitching or extra layers",
        "Spray light starch on completed fabric items for a crisper finish"
      ],
      instructions: "Step 1: Start with a clean, unwanted t-shirt.\nStep 2: Lay it flat and cut off the sleeves along the seams.\nStep 3: Cut out the neckline, making the opening wider - this will be the top of your bag.\nStep 4: Turn the shirt inside out.\nStep 5: Using fabric scissors, cut fringe strips along the bottom of the shirt, about 3-4 inches long and 1 inch wide.\nStep 6: Tie each fringe strip to the one next to it using double knots, working your way across the entire bottom.\nStep 7: Once all strips are tied, turn the shirt right-side out.\nStep 8: Trim any uneven edges or loose threads.\nStep 9: Your market bag is ready to use for groceries, gym clothes, or beach essentials.",
      tags: ["No-Sew", "T-shirt Upcycle", "Shopping Bag", "Eco-friendly", "Zero Waste", "Textile Reuse", "Beginner Friendly"],
      imageKeywords: "tshirt+tote+bag+upcycled",
      difficultyLevel: 1,
      timeRequired: 20
    };
  }
  
  else if (itemNameLower.includes("aluminum can") || itemNameLower.includes("tin can") || itemNameLower.includes("metal can")) {
    return {
      titles: [
        "Aluminum Can Lantern Set",
        "Tin Can Desk Organizer Caddy",
        "Industrial Tin Can Lamp",
        "Can Herb Garden Row Markers",
        "Mini Can Succulent Planters",
        "Can Wind Chimes Mobile",
        "Aluminum Can Rose Garden Stakes",
        "Upcycled Can Kitchen Utensil Holder"
      ],
      suggestions: [
        "Use a nail and hammer to punch decorative patterns for light to shine through",
        "File or sand all cut edges to prevent injuries",
        "Apply a clear coat sealer to prevent rusting on outdoor projects",
        "Remove paper labels with warm soapy water and baking soda paste",
        "For planters, punch drainage holes in the bottom using a nail",
        "Use spray paint designed for metal surfaces for best adhesion",
        "When cutting cans, wear gloves to protect against sharp edges",
        "Add a copper wire rim at the top of cans for a decorative finish"
      ],
      instructions: "Step 1: Begin with a clean, label-free large tin can (coffee cans work well).\nStep 2: Using a drill with a 1/8-inch metal bit, carefully drill a hole in the center of the bottom for the cord.\nStep 3: Mark and drill decorative patterns on the sides of the can using increasingly larger drill bits.\nStep 4: Sand any sharp edges to make them smooth and safe.\nStep 5: Clean out any metal shavings.\nStep 6: Spray paint the exterior with metallic or matte black spray paint designed for metal.\nStep 7: Insert a pendant light kit through the bottom hole, securing the socket inside the can.\nStep 8: Add an Edison bulb for the perfect industrial look.\nStep 9: Mount on a wooden base for stability, or attach chain or rope to create a hanging pendant.",
      tags: ["Industrial", "Lighting", "Metal Upcycle", "Home Decor", "Rustic", "Functional", "Sustainable Design"],
      imageKeywords: "tin+can+lamp+industrial",
      difficultyLevel: 3,
      timeRequired: 60
    };
  }
  
  else if (itemNameLower.includes("pallet") || itemNameLower.includes("wood")) {
    return {
      titles: [
        "Pallet Vertical Herb Garden",
        "Rustic Pallet Coffee Table with Storage",
        "Pallet Outdoor Sofa with Cushions",
        "Pallet Wall-Mounted Wine Rack",
        "Pallet Wood Floating Shelves",
        "Pallet Bed Frame with Under-Lighting",
        "Pallet Outdoor Path Tiles",
        "Pallet Wood Bathroom Organizer"
      ],
      suggestions: [
        "Use a pry bar instead of a hammer to disassemble pallets with minimal wood damage",
        "Sand all wood thoroughly to prevent splinters, starting with coarse and finishing with fine grit",
        "Apply wood conditioner before staining for more even color absorption",
        "Use a vinegar and steel wool solution for an instant weathered gray look",
        "Check pallets for the HT stamp (heat-treated) which indicates safe, non-chemical treatment",
        "Drill pilot holes to prevent wood from splitting when adding screws",
        "Apply several coats of polyurethane for outdoor projects to protect against elements",
        "Use wood glue in addition to screws for stronger joints"
      ],
      instructions: "Step 1: Start with two clean, heat-treated pallets (look for the HT stamp).\nStep 2: Sand all surfaces thoroughly, starting with 80-grit and working up to 220-grit sandpaper.\nStep 3: Apply wood conditioner, then stain in your choice of color.\nStep 4: Once dry, apply three coats of polyurethane, sanding lightly between coats.\nStep 5: Stack the pallets with the bottom one upside-down to create a storage compartment.\nStep 6: Secure together using 3-inch wood screws at each corner.\nStep 7: Add caster wheels to the bottom for mobility, screwing directly into the thicker support beams.\nStep 8: Cut a piece of plywood to size for the top surface, sand, stain, and seal to match.\nStep 9: Attach with screws from underneath and add wooden crates inside for optional storage.",
      tags: ["Pallet Furniture", "Living Room", "Rustic", "Storage Solution", "Wood Upcycle", "DIY Furniture", "Sustainable"],
      imageKeywords: "pallet+coffee+table+rustic",
      difficultyLevel: 4,
      timeRequired: 180
    };
  }
  
  else if (itemNameLower.includes("toilet paper roll") || itemNameLower.includes("paper tube")) {
    return {
      titles: [
        "Toilet Paper Roll Seed Starter Pots",
        "Cardboard Tube Desk Organizer",
        "Decorative Wall Art from Paper Tubes",
        "Toilet Paper Roll Fire Starters",
        "Cardboard Roll Advent Calendar",
        "Paper Tube Cable Organizers",
        "Bathroom Wall Shelf from Tubes",
        "Cardboard Tube Bird Feeder"
      ],
      suggestions: [
        "Cut tubes into even ring sections for uniform pieces in artwork",
        "Use modge podge or clear acrylic spray to seal cardboard and prevent warping",
        "Group and glue tubes together to create strength through numbers",
        "Paint tubes before assembly for easier coverage",
        "When using for plants, make sure to cut slits at the bottom for drainage",
        "For fire starters, dip in melted wax for longer burn time",
        "Use a paper punch to create decorative patterns in tube sides",
        "Flatten tubes and cut into strips for weaving projects"
      ],
      instructions: "Step 1: Collect 15-20 empty toilet paper rolls.\nStep 2: For each roll, make four 1-inch cuts on one end, spaced evenly around the circumference.\nStep 3: Fold these cut sections inward like closing a box, tucking the last flap under the first to secure the bottom.\nStep 4: Paint the exterior with non-toxic paint if desired, or leave natural.\nStep 5: Fill each pot with seed starting soil to about 3/4 full.\nStep 6: Plant your seeds according to package directions, usually 1/4 inch deep.\nStep 7: Water gently and place in a sunny window or under grow lights.\nStep 8: When seedlings are ready to transplant, plant the entire biodegradable pot in your garden.\nStep 9: Label each pot with a popsicle stick marker for easy identification.",
      tags: ["Gardening", "Seed Starting", "Biodegradable", "Zero Waste", "Spring Project", "Cardboard Upcycle", "Kid-Friendly"],
      imageKeywords: "toilet+paper+roll+seed+starters",
      difficultyLevel: 1,
      timeRequired: 30
    };
  }
  
  else if (itemNameLower.includes("newspaper") || itemNameLower.includes("magazine")) {
    return {
      titles: [
        "Newspaper Gift Basket with Handle",
        "Magazine Page Coasters Set",
        "Woven Magazine Page Placemat",
        "Newspaper Seedling Pots",
        "Rolled Magazine Photo Frame",
        "Waterproof Newspaper Produce Bags",
        "Magazine Page Beaded Necklace",
        "Newspaper Wall Art Typography"
      ],
      suggestions: [
        "Roll newspaper or magazine pages tightly around a skewer for strong building elements",
        "Seal finished paper crafts with clear acrylic spray for water resistance",
        "Select magazine pages with complementary colors for more attractive finished items",
        "Use a glue stick rather than liquid glue to prevent paper from wrinkling",
        "Cut uniform strips using a paper cutter for more professional results",
        "When weaving, alternate horizontal and vertical pieces for strength",
        "Use a bone folder to create crisp folds without damaging paper",
        "Apply mod podge between layers when laminating for a sturdy finish"
      ],
      instructions: "Step 1: Select 20-30 full-size colorful magazine pages.\nStep 2: Cut each page into long strips approximately 1/2 inch wide using a paper cutter.\nStep 3: Take one strip and tightly roll it from one end to the other, adding a small dot of glue at the end.\nStep 4: Continue rolling all your strips into tight coils.\nStep 5: Arrange 7 coils in a circular pattern, with one in the center and six surrounding it.\nStep 6: Use white glue to secure them together.\nStep 7: Continue adding concentric circles of coils until you reach your desired coaster size.\nStep 8: Coat both sides with three layers of mod podge, allowing drying time between coats.\nStep 9: Finish with a clear acrylic spray sealer for water resistance and create a set of 4-6 coasters.",
      tags: ["Paper Craft", "Home Decor", "Upcycled", "Coasters", "Eco-friendly", "Colorful", "Magazine Reuse"],
      imageKeywords: "magazine+coasters+recycled",
      difficultyLevel: 2,
      timeRequired: 90
    };
  }
  
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

    const aiIdeasPromise = generateMultipleAiIdeas(query, materialType, 6);

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
      
      const generatedAiIdeas = await aiIdeasPromise;
      
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
            ...generatedAiIdeas.map(aiIdea => ({
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
      
      const aiResults = await aiIdeasPromise;
      
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
        relatedIdeas: aiResults.map(aiIdea => ({
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

    const generatedIdeas = await aiIdeasPromise;

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
        relatedIdeas: generatedIdeas.map(aiIdea => ({
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
      relatedIdeas: generatedIdeas.map(aiIdea => ({
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
  try {
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
    
    const promises: Promise<SearchResult | null>[] = [];
    for (let i = 0; i < count; i++) {
      promises.push(generateRecyclingIdea(query, material));
    }
    
    const results = await Promise.all(promises);
    const ideas: SearchResult[] = [];
    
    results.forEach(result => {
      if (result && !ideas.some(idea => idea.ideaTitle === result.ideaTitle)) {
        ideas.push(result);
      }
    });
    
    const missingCount = count - ideas.length;
    if (missingCount > 0) {
      for (let i = 0; i < missingCount; i++) {
        const result = await generateRecyclingIdea(query, material);
        if (result && !ideas.some(idea => idea.ideaTitle === result.ideaTitle)) {
          ideas.push(result);
        }
      }
    }
    
    return ideas.slice(0, count);
  } catch (error) {
    console.error('Error generating multiple AI ideas:', error);
    return [];
  }
};
