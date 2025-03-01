
interface RecyclingItem {
  suggestions: string[];
  howTo: string;
}

interface RecyclingDatabase {
  [key: string]: RecyclingItem;
}

export const recyclingDatabase: RecyclingDatabase = {
  "water bottle": {
    suggestions: [
      "Cut the bottom off to create a small planter for herbs or succulents",
      "Use as a bird feeder by cutting holes and adding perches",
      "Fill with water and freeze to make an ice pack",
      "Create a self-watering system for plants by poking holes in the cap"
    ],
    howTo: "Clean thoroughly before reusing. For planters, cut the bottle horizontally and use the bottom part."
  },
  "paper": {
    suggestions: [
      "Make homemade recycled paper for crafts",
      "Create paper mache art projects",
      "Shred for packaging material or pet bedding",
      "Compost it to enrich your garden soil"
    ],
    howTo: "For paper mache, tear into strips and mix with a solution of water and glue. For composting, tear into small pieces to speed decomposition."
  },
  "cardboard": {
    suggestions: [
      "Create storage boxes or organizers",
      "Make children's toys like playhouses or cars",
      "Use as garden mulch or weed barrier",
      "Create DIY wall art or photo frames"
    ],
    howTo: "For garden use, remove any tape or labels and lay flat under a layer of soil or mulch."
  },
  "glass jar": {
    suggestions: [
      "Storage containers for pantry items",
      "Make candle holders or vases",
      "Create terrariums for small plants",
      "Use as drinking glasses or for homemade preserves"
    ],
    howTo: "Remove labels by soaking in warm soapy water. For candle holders, decorate with paint, twine, or decoupage."
  },
  "t-shirt": {
    suggestions: [
      "Cut into cleaning rags",
      "Make a reusable shopping bag (no-sew option available)",
      "Create a pillow cover",
      "Make a pet toy by braiding strips"
    ],
    howTo: "For a no-sew bag, cut off the sleeves and collar, then cut fringe at the bottom and tie the strips together."
  },
  "plastic bag": {
    suggestions: [
      "Reuse for trash or pet waste",
      "Crochet into a durable tote bag",
      "Use as padding when shipping packages",
      "Make plastic yarn (plarn) for crafts"
    ],
    howTo: "To make plarn, flatten bags, cut into strips, and loop together to form a continuous strand for crocheting or knitting."
  }
};

export const findBestMatch = (item: string): { match: string | null; score: number } => {
  const query = item.toLowerCase().trim();
  
  if (!query) {
    return { match: null, score: 0 };
  }
  
  // Direct match
  if (recyclingDatabase[query]) {
    return { match: query, score: 1 };
  }
  
  // Find closest match
  let bestMatch = null;
  let highestScore = 0;
  
  for (const key in recyclingDatabase) {
    if (query.includes(key) || key.includes(query)) {
      const score = Math.min(query.length, key.length) / Math.max(query.length, key.length);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = key;
      }
    }
  }
  
  return { match: bestMatch, score: highestScore };
};
