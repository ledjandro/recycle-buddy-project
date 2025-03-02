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
      "Organic", "Wood", "Cardboard", "Rubber", "Composite", "Cork"
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
        "Composite": ["Tetra Pak", "Coffee Cup", "Chip Bag", "Toothpaste Tube", "Disposable Diaper"],
        "Cork": ["Wine Cork", "Cork Board", "Cork Sheet", "Cork Stopper", "Cork Coaster"]
      };
      
      const items = itemNames[materialType] || ["Generic Item"];
      itemToUse = items[Math.floor(Math.random() * items.length)];
    }
    
    const ideaOptions = getItemSpecificIdeas(itemToUse, materialType);
    
    // Use a specific title from the options or generate a fallback
    const ideaTitles = ideaOptions.titles.length > 0 
      ? ideaOptions.titles 
      : generateRelevantTitles(itemToUse, materialType);
    
    const randomTitle = ideaTitles[Math.floor(Math.random() * ideaTitles.length)];
    
    // Get specific or fallback suggestions
    const suggestionPool = ideaOptions.suggestions.length > 0 
      ? ideaOptions.suggestions 
      : generateRelevantSuggestions(itemToUse, materialType, randomTitle);
    
    // Select a subset of the suggestions
    const shuffledSuggestions = [...suggestionPool].sort(() => 0.5 - Math.random());
    const selectedSuggestions = shuffledSuggestions.slice(0, Math.floor(Math.random() * 3) + 3);
    
    // Use specific instructions or fallback
    const instructions = ideaOptions.instructions || 
      generateRelevantInstructions(itemToUse, materialType, randomTitle);
    
    // Set reasonable difficulty and time values
    const difficulty = ideaOptions.difficultyLevel || Math.floor(Math.random() * 5) + 1;
    const time = ideaOptions.timeRequired || (Math.floor(Math.random() * 6) + 1) * 15;
    
    // Use specific tags or fallback
    const possibleTags = ideaOptions.tags.length > 0 
      ? ideaOptions.tags 
      : generateRelevantTags(itemToUse, materialType, randomTitle);
    
    const shuffledTags = [...possibleTags].sort(() => 0.5 - Math.random());
    const selectedTags = shuffledTags.slice(0, Math.floor(Math.random() * 3) + 2);
    
    // Set appropriate image search keywords
    const imageCategory = ideaOptions.imageKeywords || `${itemToUse.toLowerCase()} upcycle ${randomTitle.toLowerCase()}`;
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

function generateRelevantTitles(itemName: string, materialType: string): string[] {
  const itemNameLower = itemName.toLowerCase();
  
  if (itemNameLower.includes("wine cork") || itemNameLower.includes("cork")) {
    return [
      "Wine Cork Bulletin Board",
      "Wine Cork Trivet",
      "Wine Cork Keychain",
      "Cork Coasters Set",
      "Cork-Bottom Planters",
      "Wine Cork Bath Mat",
      "Cork Cabinet Knobs",
      "Wine Cork Wreath"
    ];
  }
  
  if (itemNameLower.includes("plastic bottle")) {
    return [
      "Plastic Bottle Self-Watering Planter",
      "Plastic Bottle Bird Feeder",
      "Bottle Terrarium Garden",
      "Bottle Desk Organizer",
      "Plastic Bottle Lamp Shade"
    ];
  }
  
  if (itemNameLower.includes("glass jar") || itemNameLower.includes("mason jar")) {
    return [
      "Mason Jar Herb Garden",
      "Solar Jar Lantern",
      "Jar Snow Globe",
      "Bathroom Storage Jars",
      "Jar Terrarium"
    ];
  }
  
  if (itemNameLower.includes("tin can") || itemNameLower.includes("aluminum can")) {
    return [
      "Tin Can Lanterns",
      "Painted Can Planters",
      "Can Wind Chimes",
      "Can Desk Organizer",
      "Can String Lights"
    ];
  }
  
  if (itemNameLower.includes("umbrella") || itemNameLower.includes("broken umbrella")) {
    return [
      "Umbrella Tote Bag",
      "Umbrella Fabric Pillowcase",
      "Umbrella Rain Boots Cover",
      "Umbrella Garden Shade",
      "Umbrella Fabric Wall Art"
    ];
  }
  
  // Generic fallback options
  return [
    `${itemName} Home Décor`,
    `Upcycled ${itemName} Storage`,
    `${itemName} Garden Accessory`,
    `${materialType} Art Piece`,
    `${itemName} Functional Holder`
  ];
}

function generateRelevantSuggestions(itemName: string, materialType: string, ideaTitle: string): string[] {
  const itemNameLower = itemName.toLowerCase();
  const titleLower = ideaTitle.toLowerCase();
  
  // Wine cork specific suggestions
  if (itemNameLower.includes("wine cork") || itemNameLower.includes("cork")) {
    if (titleLower.includes("bulletin board")) {
      return [
        "Collect at least 100-200 wine corks for a medium-sized board",
        "Cut corks in half lengthwise to create a flat backing surface",
        "Arrange corks in a pattern before gluing to test the design",
        "Use wood glue for better adhesion between corks",
        "Add a wooden frame around the edges for a finished look",
        "Apply a clear sealant to protect the corks from moisture"
      ];
    }
    
    if (titleLower.includes("trivet")) {
      return [
        "Select corks of similar height for a level surface",
        "Arrange corks in a circular or square pattern",
        "Use a hot glue gun to connect the corks tightly",
        "Add a backing material like felt to protect surfaces",
        "Consider sealing with a food-safe finish for durability",
        "Create multiple trivets in different sizes for a set"
      ];
    }
    
    if (titleLower.includes("keychain")) {
      return [
        "Select intact, attractive corks with interesting winery stamps",
        "Drill a small hole through the center of the cork",
        "Thread a keyring through the hole using a jump ring",
        "Add decorative beads or charms for personalization",
        "Apply a clear sealant to protect the cork from wear",
        "Attach a small tag with the winery name for a special touch"
      ];
    }
    
    if (titleLower.includes("coaster")) {
      return [
        "Slice wine corks into 1/4 inch thick rounds",
        "Arrange the cork slices in a circular pattern on a template",
        "Glue the slices together using a strong adhesive",
        "Add a thin cork sheet on the bottom for stability",
        "Seal with polyurethane spray to make it waterproof",
        "Create a set of 4-6 coasters for a complete gift"
      ];
    }
    
    return [
      "Clean and sort corks by size and condition",
      "Use a sharp knife or saw to cut corks as needed",
      "Pre-arrange your design before gluing for best results",
      "Consider using a backing material for stability",
      "Apply a sealant to protect from moisture and dirt",
      "Personalize with paint, stamps, or other decorations"
    ];
  }
  
  // Plastic bottle specific suggestions
  if (itemNameLower.includes("plastic bottle")) {
    if (titleLower.includes("planter")) {
      return [
        "Select a clean plastic bottle with a smooth surface",
        "Cut the bottle horizontally to create a container and water reservoir",
        "Punch drainage holes in the upper section",
        "Create a wick from cotton rope to connect soil to water",
        "Decorate the exterior with weather-resistant paint",
        "Consider adding legs or a stand to elevate the planter"
      ];
    }
    
    if (titleLower.includes("bird feeder")) {
      return [
        "Clean a plastic bottle thoroughly and remove labels",
        "Cut small feeding holes about 1/3 up from the bottom",
        "Insert wooden spoons or dowels through the bottle as perches",
        "Create a roof from the bottle cap or other materials",
        "Punch drainage holes in the very bottom for rainwater",
        "Attach strong string or wire for hanging the feeder"
      ];
    }
    
    return [
      "Clean the bottle thoroughly and remove all labels",
      "Use a sharp utility knife or scissors for cutting",
      "Smooth any rough edges with sandpaper",
      "Consider heating the plastic briefly to shape it",
      "Add multiple bottles together for larger projects",
      "Paint with plastic-specific paints for durability"
    ];
  }
  
  // Umbrella specific suggestions
  if (itemNameLower.includes("umbrella") || itemNameLower.includes("broken umbrella")) {
    if (titleLower.includes("tote")) {
      return [
        "Carefully remove the fabric from the umbrella frame",
        "Clean the fabric thoroughly with mild soap and water",
        "Create a paper pattern for your tote design",
        "Cut the umbrella fabric according to your pattern",
        "Use a heavy-duty needle for sewing waterproof material",
        "Add sturdy handles from webbing or the umbrella handle"
      ];
    }
    
    if (titleLower.includes("pillowcase")) {
      return [
        "Select the best sections of the umbrella fabric",
        "Pre-wash the fabric to test colorfastness",
        "Cut fabric to standard pillowcase dimensions plus seam allowance",
        "Sew with appropriate needle for synthetic fabrics",
        "Add a zipper or envelope closure for easy removal",
        "Consider backing with cotton fabric for comfort"
      ];
    }
    
    return [
      "Disassemble the umbrella carefully to preserve the fabric",
      "Clean the fabric thoroughly before reusing",
      "Treat the fabric with waterproof spray if needed",
      "Use sharp scissors designed for synthetic fabrics",
      "Prepare a paper pattern before cutting the fabric",
      "Sew with appropriate heavy-duty needles and thread"
    ];
  }
  
  // Generic fallback suggestions based on material
  const materialSuggestions: Record<string, string[]> = {
    "Plastic": [
      "Clean the plastic item thoroughly with soap and water",
      "Remove any labels or adhesive with oil or alcohol",
      "Use sharp scissors or a utility knife for cutting plastic",
      "Smooth rough edges with fine sandpaper",
      "Use plastic-specific paints or primers for decoration",
      "Consider heat-forming techniques for reshaping"
    ],
    "Glass": [
      "Clean glass thoroughly with vinegar solution",
      "Handle with care and use proper protection when cutting glass",
      "Use glass paint or etching cream for decoration",
      "Add decorative elements with hot glue for texture",
      "Consider frosting techniques for privacy or style",
      "Use rubber grommets for any drilled holes to prevent cracking"
    ],
    "Metal": [
      "Remove any rust with vinegar or commercial remover",
      "Sand the surface for better paint adhesion",
      "Use metal primer before applying decorative paint",
      "Wear gloves to protect from sharp edges",
      "Use a punch tool to create decorative hole patterns",
      "Seal painted surfaces with clear enamel for durability"
    ],
    "Textile": [
      "Wash and dry the fabric before beginning your project",
      "Iron fabric to remove wrinkles for easier cutting",
      "Use fabric scissors for clean cuts",
      "Pin pattern pieces before cutting for accuracy",
      "Use appropriate needle and thread for fabric weight",
      "Pre-test any dyes or paints on scrap fabric"
    ]
  };
  
  return materialSuggestions[materialType] || [
    `Clean the ${itemName} thoroughly before starting`,
    `Gather all necessary tools and materials`,
    `Prepare a workspace with proper protection`,
    `Follow safety precautions when cutting or altering the item`,
    `Allow adequate drying time between steps`,
    `Apply a protective finish appropriate for the material`
  ];
}

function generateRelevantInstructions(itemName: string, materialType: string, ideaTitle: string): string {
  const itemNameLower = itemName.toLowerCase();
  const titleLower = ideaTitle.toLowerCase();
  
  // Wine cork specific instructions
  if (itemNameLower.includes("wine cork") || itemNameLower.includes("cork")) {
    if (titleLower.includes("bulletin board")) {
      return "Step 1: Collect 100-200 wine corks depending on desired board size.\nStep 2: Select a wooden board or frame as your base.\nStep 3: Plan your cork arrangement - rows, patterns, or designs.\nStep 4: Cut some corks in half lengthwise to create flat-backed pieces.\nStep 5: Apply wood glue to the back of each cork and press firmly onto the board.\nStep 6: Allow the glue to dry completely for 24 hours.\nStep 7: Attach hanging hardware to the back of the board.\nStep 8: Optional: Apply a clear sealant spray to protect the corks.\nStep 9: Add pushpins or thumbtacks and start posting your notes and photos.";
    }
    
    if (titleLower.includes("trivet")) {
      return "Step 1: Collect 20-30 wine corks of similar height.\nStep 2: Decide on a shape for your trivet - square, round, or hexagonal.\nStep 3: Arrange the corks on a flat surface in your desired pattern.\nStep 4: Apply a strong adhesive like E6000 or hot glue between touching cork surfaces.\nStep 5: Press corks firmly together and hold until initial bond is set.\nStep 6: Allow the adhesive to cure completely according to product instructions.\nStep 7: Apply a thin strip of adhesive to the bottom perimeter and attach felt backing.\nStep 8: Optional: Spray with a clear, food-safe sealant to protect from moisture.\nStep 9: Let the trivet dry completely before using under hot pots or dishes.";
    }
    
    if (titleLower.includes("coaster")) {
      return "Step 1: Collect 7-10 wine corks per coaster.\nStep 2: Using a sharp knife, slice the corks into rounds approximately 1/4 inch thick.\nStep 3: Arrange the cork slices in a circular pattern on wax paper.\nStep 4: Apply a small dot of wood glue between touching cork pieces.\nStep 5: Press firmly and wipe away any excess glue that squeezes out.\nStep 6: Allow to dry completely for at least 4 hours.\nStep 7: Cut a circle of thin cork sheet slightly smaller than your coaster for the base.\nStep 8: Glue this cork circle to the bottom of your coaster for stability.\nStep 9: Apply 2-3 coats of polyurethane spray, allowing drying time between coats.";
    }
    
    return "Step 1: Clean and sort your wine corks by size and condition.\nStep 2: Sketch your design or use a template as a guide.\nStep 3: Cut or modify corks as needed using a sharp utility knife.\nStep 4: Arrange the corks in your desired pattern before gluing.\nStep 5: Apply wood glue or hot glue to attach corks to each other and/or a backing material.\nStep 6: Press firmly and allow adequate drying time between steps.\nStep 7: Add any decorative elements like paint, ribbon, or embellishments.\nStep 8: Apply a sealant appropriate for your project's use.\nStep 9: Attach any hardware needed for hanging or using your creation.";
  }
  
  // Plastic bottle specific instructions
  if (itemNameLower.includes("plastic bottle")) {
    if (titleLower.includes("planter")) {
      return "Step 1: Take a clean plastic bottle and remove all labels and adhesive.\nStep 2: Cut the bottle horizontally about 1/3 from the bottom using sharp scissors.\nStep 3: Drill or punch 3-4 small drainage holes in the bottom section.\nStep 4: Cut small notches around the top edge of the bottom section.\nStep 5: Take the top section and invert it, fitting it into the bottom section.\nStep 6: Thread a piece of cotton rope or fabric strip through the bottle cap to act as a wick.\nStep 7: Fill the top section with potting soil, leaving the wick extending into the soil.\nStep 8: Plant your seeds or small plants in the soil.\nStep 9: Fill the bottom reservoir with water and place in a sunny location.";
    }
    
    if (titleLower.includes("bird feeder")) {
      return "Step 1: Clean a plastic bottle thoroughly and remove the label.\nStep 2: Mark feeding hole locations about 1/3 up from the bottom, on opposite sides.\nStep 3: Cut small holes (1-2 inches diameter) at your marked spots using a sharp knife.\nStep 4: Drill or punch small drainage holes in the very bottom of the bottle.\nStep 5: Insert wooden dowels or spoons through the bottle just below the feeding holes to create perches.\nStep 6: Create a roof by cutting a circle from plastic or other waterproof material.\nStep 7: Attach the roof over the bottle cap using strong adhesive or wire.\nStep 8: Punch two small holes at the top and thread strong cord for hanging.\nStep 9: Fill with birdseed through the bottle opening and hang in a sheltered location.";
    }
    
    return "Step 1: Clean your plastic bottle thoroughly and remove all labels.\nStep 2: Plan your design and mark cutting lines with a permanent marker.\nStep 3: Cut the bottle carefully using sharp scissors or a utility knife.\nStep 4: Sand any rough edges to prevent injury.\nStep 5: Assemble the cut pieces according to your project design.\nStep 6: Use hot glue or appropriate adhesive to secure connections.\nStep 7: Paint the exterior with plastic-specific paint if desired.\nStep 8: Allow to dry completely between coats.\nStep 9: Add any finishing touches or decorative elements to complete your project.";
  }
  
  // Umbrella specific instructions
  if (itemNameLower.includes("umbrella") || itemNameLower.includes("broken umbrella")) {
    if (titleLower.includes("tote")) {
      return "Step 1: Carefully disassemble the umbrella, separating the fabric from the frame.\nStep 2: Clean the fabric thoroughly with mild soap and water, then dry completely.\nStep 3: Create a paper pattern for your tote bag based on the available fabric.\nStep 4: Fold the fabric in half and pin your pattern on top.\nStep 5: Cut along the pattern lines using sharp scissors.\nStep 6: Sew the sides and bottom of the bag using a sewing machine with a heavy-duty needle.\nStep 7: For the handles, cut strips from extra umbrella fabric or use webbing.\nStep 8: Sew the handles securely to the inside of the bag.\nStep 9: Add a button, snap, or zipper closure if desired.";
    }
    
    if (titleLower.includes("garden shade")) {
      return "Step 1: Remove the fabric canopy from the broken umbrella frame.\nStep 2: Clean the fabric thoroughly and allow to dry completely.\nStep 3: Cut the fabric into your desired shape for garden shade.\nStep 4: Hem the edges of the fabric to prevent fraying.\nStep 5: Attach grommets along the edges at regular intervals.\nStep 6: Install posts or use existing structures in your garden for mounting.\nStep 7: Thread strong cord or wire through the grommets.\nStep 8: Secure the shade to your posts or structures, pulling taut.\nStep 9: Adjust the height and angle to provide optimal shade for your plants.";
    }
    
    return "Step 1: Carefully disassemble the broken umbrella to salvage the waterproof fabric.\nStep 2: Clean the fabric using mild soap and water, then dry completely.\nStep 3: Iron the fabric on low heat to remove wrinkles if necessary.\nStep 4: Create a paper pattern for your project based on available fabric.\nStep 5: Cut the umbrella fabric according to your pattern.\nStep 6: Use a heavy-duty needle and polyester thread for sewing.\nStep 7: Assemble the pieces according to your project design.\nStep 8: Reinforce stress points with extra stitching or patches.\nStep 9: Add any decorative elements or practical features to complete your project.";
  }
  
  // Generic fallback instructions based on material type
  const materialInstructions: Record<string, string> = {
    "Plastic": "Step 1: Clean your plastic item thoroughly with soap and water.\nStep 2: Remove any labels or adhesive using oil or alcohol.\nStep 3: Draw your design or cutting lines with a permanent marker.\nStep 4: Carefully cut the plastic using appropriate scissors or tools.\nStep 5: Sand any rough edges to prevent injuries.\nStep 6: Apply plastic primer if you plan to paint the item.\nStep 7: Paint with plastic-specific paints in thin, even coats.\nStep 8: Allow adequate drying time between coats.\nStep 9: Apply a clear sealant to protect your finished project.",
    
    "Glass": "Step 1: Clean the glass thoroughly with vinegar and water solution.\nStep 2: Plan your design and mark any cutting lines with a non-permanent marker.\nStep 3: Protect your work surface and wear safety glasses if cutting glass.\nStep 4: Apply glass paint, frosting spray, or etching cream as desired.\nStep 5: Allow proper drying or setting time according to product instructions.\nStep 6: Apply additional coats or colors as needed for your design.\nStep 7: Heat-set painted designs according to paint manufacturer instructions.\nStep 8: Add any embellishments like beads, wire, or decorative elements.\nStep 9: Apply a protective clear coat if recommended for your materials.",
    
    "Metal": "Step 1: Clean the metal surface thoroughly to remove dirt and oils.\nStep 2: Remove any rust using vinegar solution or commercial rust remover.\nStep 3: Sand the surface to create better adhesion for paint or finishes.\nStep 4: Apply a metal primer and allow to dry completely.\nStep 5: Paint with metal-specific paint in thin, even coats.\nStep 6: Create any desired patterns, holes, or bends in the metal.\nStep 7: Add decorative elements like beads, wire, or other materials.\nStep 8: Seal with a clear protective coating appropriate for your project's use.\nStep 9: Attach any hardware needed for hanging or displaying your creation.",
    
    "Textile": "Step 1: Wash and dry the fabric to remove any sizing or dirt.\nStep 2: Iron the fabric to remove wrinkles for easier cutting.\nStep 3: Create or trace a pattern onto the fabric with fabric markers.\nStep 4: Cut the fabric precisely using sharp fabric scissors.\nStep 5: Pin pieces together if you'll be sewing multiple sections.\nStep 6: Sew the pieces together using appropriate thread and needle.\nStep 7: Turn the project right-side out if applicable and press seams.\nStep 8: Add any closures, decorative elements, or embellishments.\nStep 9: Give your creation a final press and trim any loose threads."
  };
  
  return materialInstructions[materialType] || `Step 1: Clean the ${itemName} thoroughly before beginning.\nStep 2: Gather all necessary tools and materials for your project.\nStep 3: Measure and mark any cutting lines needed for your design.\nStep 4: Carefully cut or modify the item according to your plan.\nStep 5: Smooth any rough edges or surfaces as appropriate for the material.\nStep 6: Assemble the components of your ${ideaTitle}.\nStep 7: Secure parts together using appropriate adhesive or fasteners.\nStep 8: Apply paint, fabric, or decorative elements as desired.\nStep 9: Allow your project to dry completely before using.`;
}

function generateRelevantTags(itemName: string, materialType: string, ideaTitle: string): string[] {
  const itemNameLower = itemName.toLowerCase();
  const titleLower = ideaTitle.toLowerCase();
  
  // Base tags that apply to most projects
  const baseTags = ["Upcycled", "DIY", "Sustainable", "Eco-friendly", "Zero Waste"];
  
  // Material specific tags
  const materialTags: Record<string, string[]> = {
    "Plastic": ["Plastic Upcycle", "Plastic Alternative", "Single-Use Reduction"],
    "Glass": ["Glass Reuse", "Repurposed Glass", "Bottle Craft"],
    "Metal": ["Metal Upcycle", "Industrial", "Metal Craft"],
    "Paper": ["Paper Craft", "Paper Reuse", "Paper Art"],
    "Textile": ["Fabric Upcycle", "No-Sew", "Textile Reuse"],
    "Wood": ["Wood Craft", "Reclaimed Wood", "Rustic"],
    "Cardboard": ["Cardboard Craft", "Box Reuse", "Cardboard Upcycle"],
    "Cork": ["Cork Craft", "Wine Lover", "Cork Upcycle"]
  };
  
  // Function tags based on project type
  const functionTags: string[] = [];
  
  if (titleLower.includes("planter") || titleLower.includes("garden")) {
    functionTags.push("Gardening", "Indoor Plants", "Plant Lover");
  }
  
  if (titleLower.includes("lamp") || titleLower.includes("light") || titleLower.includes("lantern")) {
    functionTags.push("Lighting", "Home Decor", "Mood Lighting");
  }
  
  if (titleLower.includes("organizer") || titleLower.includes("storage") || titleLower.includes("holder")) {
    functionTags.push("Organization", "Storage Solution", "Declutter");
  }
  
  if (titleLower.includes("table") || titleLower.includes("chair") || titleLower.includes("shelf")) {
    functionTags.push("Furniture", "Home Improvement", "Interior Design");
  }
  
  if (titleLower.includes("art") || titleLower.includes("decor") || titleLower.includes("decoration")) {
    functionTags.push("Wall Art", "Home Decor", "Decorative");
  }
  
  if (titleLower.includes("toy") || titleLower.includes("game") || titleLower.includes("kids")) {
    functionTags.push("Kids Craft", "Educational", "Play Time");
  }
  
  if (titleLower.includes("jewelry") || titleLower.includes("necklace") || titleLower.includes("bracelet")) {
    functionTags.push("Wearable", "Fashion", "Accessories");
  }
  
  // Specific tags for wine cork projects
  if (itemNameLower.includes("wine cork") || itemNameLower.includes("cork")) {
    const corkTags = ["Wine Lover", "Cork Craft", "Cork Upcycle"];
    
    if (titleLower.includes("bulletin") || titleLower.includes("board")) {
      corkTags.push("Office Decor", "Organization", "Message Board");
    }
    
    if (titleLower.includes("trivet") || titleLower.includes("coaster")) {
      corkTags.push("Kitchen Accessory", "Dining", "Tableware", "Hostess Gift");
    }
    
    if (titleLower.includes("keychain")) {
      corkTags.push("Accessories", "Gift Idea", "Wine Memorabilia");
    }
    
    return [...baseTags, ...corkTags].slice(0, 8);
  }
  
  // Combine all relevant tags and remove duplicates
  const allTags = [
    ...baseTags,
    ...(materialTags[materialType] || []),
    ...functionTags,
    materialType
  ];
  
  const uniqueTags = [...new Set(allTags)];
  return uniqueTags.slice(0, 8); // Return up to 8 tags
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
      instructions: "To create a Mason Jar Pendant Light: Start by thoroughly cleaning your mason jar and removing the lid (keep the rim). Using a hammer and nail, carefully punch a hole in the center of the lid. Thread your pendant light cord through this hole from inside the lid. Next, secure the socket to the lid following the kit instructions. Select a decorative Edison bulb that will fit inside the jar. Screw the rim back onto the jar with the light assembly. Finally, hang your new pendant light and adjust the cord length as needed. This makes an excellent light fixture for kitchen islands, dining areas, or bedside tables.",
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
        "Add a wick
