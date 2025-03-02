<lov-code>
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
    let instructions = generateRelevantInstructions(itemToUse, materialType, randomTitle);
    
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
    
    if (titleLower.includes("keychain")) {
      return "Step 1: Select an intact wine cork with an interesting winery stamp if possible.\nStep 2: Use a small drill bit to create a hole through the cork lengthwise.\nStep 3: Insert a small eyelet screw into one end of the cork.\nStep 4: Attach a split ring or key ring to the eyelet.\nStep 5: Optional: Add small decorative beads or charms to personalize.\nStep 6: Apply a thin coat of clear polyurethane to seal and protect the cork.\nStep 7: Allow to dry completely for 24 hours.\nStep 8: Add a small tassel or leather strap for easier handling if desired.\nStep 9: Attach your keys and enjoy your unique, eco-friendly keychain.";
    }
    
    if (titleLower.includes("wreath")) {
      return "Step 1: Collect 80-100 wine corks for a medium-sized wreath.\nStep 2: Purchase a foam or wire wreath form as your base.\nStep 3: Sort corks by color if desired for a pattern or gradient effect.\nStep 4: Use a hot glue gun to attach corks to the wreath form.\nStep 5: Position corks in a radial pattern, pointing outward from the center.\nStep 6: Continue adding corks until the entire form is covered.\nStep 7: Add a ribbon loop to the back for hanging.\nStep 8: Decorate with small artificial flowers, leaves, or berries if desired.\nStep 9: Hang your cork wreath on a door or wall as eco-friendly decor.";
    }
    
    // General cork project instructions if no specific match
    return "Step 1: Clean and sort your wine corks by size and condition.\nStep 2: Sketch your design or use a template as a guide.\nStep 3: Cut or modify corks as needed using a sharp utility knife.\nStep 4: Arrange the corks in your desired pattern before gluing.\nStep 5: Apply wood glue or hot glue to attach corks to each other and/or a backing material.\nStep 6: Press firmly and allow adequate drying time between steps.\nStep 7: Add any decorative elements like paint, ribbon, or embellishments.\nStep 8: Apply a sealant appropriate for your project's use.\nStep 9: Attach any hardware needed for hanging or using your creation.";
  }
  
  // Plastic bottle specific instructions
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
    
    if (titleLower.includes("smartphone amplifier")) {
      return "Step 1: Select a plastic bottle with a wide mouth.\nStep 2: Clean the bottle thoroughly and remove the label.\nStep 3: Draw an outline for a phone-sized slot on the side of the bottle.\nStep 4: Cut out the slot using a sharp utility knife or scissors.\nStep 5: Sand the edges of the cut to prevent scratching your phone.\nStep 6: Decorate the bottle with paint or decorative tape if desired.\nStep 7: Allow any paint to dry completely.\nStep 8: Place your smartphone in the slot with the speaker facing into the bottle.\nStep 9: Enjoy the amplified sound created by the bottle's acoustic properties.";
    }
    
    if (titleLower.includes("hydroponic")) {
      return "Step 1: Clean a large plastic bottle and remove all labels.\nStep 2: Cut the bottle horizontally about 1/3 from the top.\nStep 3: Drill or cut 2-3 holes in the bottle cap, sized to fit small net pots.\nStep 4: Invert the top portion and place it into the bottom section.\nStep 5: Fill the bottom section with hydroponic nutrient solution.\nStep 6: Insert small plants in net pots through the cap holes.\nStep 7: Make sure the roots reach down into the nutrient solution.\nStep 8: Place in a location with appropriate light for your plants.\nStep 9: Change the nutrient solution weekly and monitor plant growth.";
    }
    
    // General plastic bottle project instructions if no specific match
    return "Step 1: Clean your plastic bottle thoroughly and remove all labels.\nStep 2: Plan your design and mark cutting lines with a permanent marker.\nStep 3: Cut the bottle carefully using sharp scissors or a utility knife.\nStep 4: Sand any rough edges to prevent injury.\nStep 5: Assemble the cut pieces according to your project design.\nStep 6: Use hot glue or appropriate adhesive to secure connections.\nStep 7: Paint the exterior with plastic-specific paint if desired.\nStep 8: Allow to dry completely between coats.\nStep 9: Add any finishing touches or decorative elements to complete your project.";
  }
  
  // Glass jar specific instructions
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
    
    if (titleLower.includes("terrarium")) {
      return "Step 1: Clean your glass jar thoroughly and allow to dry completely.\nStep 2: Add a 1-inch layer of small pebbles or gravel at the bottom.\nStep 3: Add a thin layer of activated charcoal to prevent mold and odors.\nStep 4: Add a layer of sphagnum moss to separate the drainage from the soil.\nStep 5: Fill about 2-3 inches with potting soil formulated for succulents or cacti.\nStep 6: Create small holes in the soil and carefully plant your succulents or mosses.\nStep 7: Add decorative elements like small figurines or colored stones.\nStep 8: Use a spray bottle to lightly mist the plants.\nStep 9: Place in indirect sunlight and water sparingly every 2-3 weeks.";
    }
    
    if (titleLower.includes("layered sand art")) {
      return "Step 1: Clean your mason jar thoroughly and dry completely.\nStep 2: Purchase colored sand in 4-6 different colors.\nStep 3: Plan your design - layers can be even or create patterns and landscapes.\nStep 4: Using a funnel, carefully pour your first sand color into the jar.\nStep 5: Gently tap the jar to create a level surface before adding the next color.\nStep 6: Continue adding different colored layers using the funnel.\nStep 7: For advanced designs, use a thin stick to push sand against the glass creating patterns.\nStep 8: Fill to about 1/2 inch from the top.\nStep 9: Seal the jar tightly with the lid to preserve your sand art.";
    }
    
    // General glass jar project instructions if no specific match
    return "Step 1: Clean your glass jar thoroughly and remove all labels.\nStep 2: If painting, use glass-specific paint for best adhesion.\nStep 3: For cutting or drilling, use appropriate glass tools and safety equipment.\nStep 4: Prepare any embellishments or decorative elements.\nStep 5: Assemble your project according to your specific design.\nStep 6: Allow adequate drying time for any adhesives or paint.\nStep 7: Apply a sealer if the project will be exposed to moisture.\nStep 8: Add any hardware needed for hanging or displaying.\nStep 9: Allow the project to cure completely before using.";
  }
  
  // Umbrella specific instructions
  if (itemNameLower.includes("umbrella") || itemNameLower.includes("broken umbrella")) {
    if (titleLower.includes("tote")) {
      return "Step 1: Carefully disassemble the umbrella, separating the fabric from the frame.\nStep 2: Clean the fabric thoroughly with mild soap and water, then dry completely.\nStep 3: Create a paper pattern for your tote bag based on the available fabric.\nStep 4: Fold the fabric in half and pin your pattern on top.\nStep 5: Cut along the pattern lines using sharp scissors.\nStep 6: Sew the sides and bottom of the bag using a sewing machine with a heavy-duty needle.\nStep 7: For the handles, cut strips from extra umbrella fabric or use webbing.\nStep 8: Sew the handles securely to the inside of the bag.\nStep 9: Add a button, snap, or zipper closure if desired.";
    }
    
    if (titleLower.includes("garden shade")) {
      return "Step 1: Remove the fabric canopy from the broken umbrella frame.\nStep 2: Clean the fabric thoroughly and allow to dry completely.\nStep 3: Cut the fabric into your desired shape for garden shade.\nStep 4: Hem the edges of the fabric to prevent fraying.\nStep 5: Attach grommets along the edges at regular intervals.\nStep 6: Install posts or use existing structures in your garden for mounting.\nStep 7: Thread strong cord or wire through the grommets.\nStep 8: Secure the shade to your posts or structures, pulling taut.\nStep 9: Adjust the height and angle to provide optimal shade for your plants.";
    }
    
    if (titleLower.includes("pillowcase")) {
      return "Step 1: Remove the fabric from the umbrella frame carefully.\nStep 2: Clean the fabric thoroughly with mild detergent and allow to dry.\nStep 3: Measure and cut the fabric to match standard pillowcase dimensions plus seam allowance.\nStep 4: Fold the fabric in half with right sides together.\nStep 5: Sew along two sides, leaving one end open for the pillow.\nStep 6: Create a hem at the open end by folding over twice and stitching.\nStep 7: Turn the pillowcase right side out and press all seams.\nStep 8: Add decorative stitching, buttons, or appliqués if desired.\nStep 9: Insert your pillow and enjoy your waterproof pillowcase.";
    }
    
    if (titleLower.includes("wall art")) {
      return "Step 1: Remove the fabric from the umbrella frame.\nStep 2: Clean the fabric thoroughly and iron on low heat.\nStep 3: Purchase an artist's canvas or wooden frame in your desired size.\nStep 4: Cut the umbrella fabric slightly larger than your frame.\nStep 5: Stretch the fabric over the frame, ensuring patterns are properly aligned.\nStep 6: Secure with staples on the back side, pulling fabric taut as you work.\nStep 7: Trim excess fabric leaving about 1 inch overhang.\nStep 8: Fold corners neatly and secure with additional staples.\nStep 9: Add hanging hardware to the back and display your unique wall art.";
    }
    
    // General umbrella project instructions if no specific match
    return "Step 1: Carefully disassemble the broken umbrella to salvage the waterproof fabric.\nStep 2: Clean the fabric using mild soap and water, then dry completely.\nStep 3: Iron the fabric on low heat to remove wrinkles if necessary.\nStep 4: Create a paper pattern for your project based on available fabric.\nStep 5: Cut the umbrella fabric according to your pattern.\nStep 6: Use a heavy-duty needle and polyester thread for sewing.\nStep 7: Assemble the pieces according to your project design.\nStep 8: Reinforce stress points with extra stitching or patches.\nStep 9: Add any decorative elements or practical features to complete your project.";
  }
  
  // Metal can specific instructions
  if (itemNameLower.includes("tin can") || itemNameLower.includes("aluminum can") || itemNameLower.includes("metal can")) {
    if (titleLower.includes("lantern")) {
      return "Step 1: Clean the can thoroughly and remove the label.\nStep 2: Fill the can with water and freeze to prevent denting while working.\nStep 3: Draw or trace a pattern on the can with a permanent marker.\nStep 4: Using a nail and hammer, punch holes along your pattern lines.\nStep 5: Allow ice to melt and drain before proceeding.\nStep 6: Sand any sharp edges around the holes and rim.\nStep 7: Spray paint the can in your preferred color.\nStep 8: Add wire to create a handle for hanging.\nStep 9: Place a tea light or LED candle inside to illuminate your pattern.";
    }
    
    if (titleLower.includes("planter") || titleLower.includes("herb")) {
      return "Step 1: Clean the can thoroughly and remove the label.\nStep 2: Using a hammer and nail, punch 3-4 drainage holes in the bottom.\nStep 3: Sand the top rim to remove any sharp edges.\nStep 4: Apply a metal primer to prevent rusting.\nStep 5: Paint the can with outdoor-rated paint in your desired color.\nStep 6: Apply a clear sealer to protect the paint from water damage.\nStep 7: Add a layer of gravel at the bottom for drainage.\nStep 8: Fill with potting soil appropriate for your plants.\nStep 9: Plant herbs or flowers and water sparingly at first.";
    }
    
    if (titleLower.includes("organizer") || titleLower.includes("utensil holder")) {
      return "Step 1: Collect 3-5 clean, label-free cans of varying heights.\nStep 2: Sand the top edges to ensure safety.\nStep 3: Clean with soap and water, then dry thoroughly.\nStep 4: Apply metal primer to all cans.\nStep 5: Paint with your chosen colors – consider a theme or gradient.\nStep 6: Allow to dry completely between coats.\nStep 7: Apply a clear sealer to protect the finish.\nStep 8: Arrange cans on a base or attach them to each other with strong adhesive.\nStep 9: Fill with pens, brushes, utensils, or other items needing organization.";
    }
    
    if (titleLower.includes("wind chime")) {
      return "Step 1: Collect 5-7 cans of various sizes for different tones.\nStep 2: Clean cans thoroughly and remove labels.\nStep 3: Use a nail to punch a hole in the bottom center of each can.\nStep 4: Sand all edges to remove any sharp points.\nStep 5: Paint the cans with outdoor-rated paint in your chosen colors.\nStep 6: Apply a clear, weatherproof sealer once paint is dry.\nStep 7: Thread fishing line or thin wire through each can, securing with knots or beads.\nStep 8: Attach all strings to a central wooden or metal ring.\nStep 9: Hang in a breezy location and enjoy the gentle sounds.";
    }
    
    // General can project instructions if no specific match
    return "Step 1: Clean the can thoroughly and remove any labels.\nStep 2: Sand the top rim to remove sharp edges.\nStep 3: Punch or drill holes as needed for your project.\nStep 4: Apply a metal primer to prevent rusting.\nStep 5: Paint with metal-appropriate paint in your chosen colors.\nStep 6: Allow paint to dry completely between coats.\nStep 7: Apply a protective clear coat, especially for outdoor projects.\nStep 8: Add any embellishments or attached parts to complete your design.\nStep 9: Allow all adhesives and finishes to cure completely before using.";
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
    
    if (titleLower.includes("pillow")) {
      return "Step 1: Select a t-shirt with a design you want to feature.\nStep 2: Turn the shirt inside out and pin around the design, creating a square or rectangle.\nStep 3: Sew along your pinned line, leaving one side open.\nStep 4: Cut around your stitching, leaving a 1/2 inch seam allowance.\nStep 5: Turn right-side out through the opening.\nStep 6: Fill with polyester fiberfill or a pillow insert.\nStep 7: Hand-stitch the opening closed using a
