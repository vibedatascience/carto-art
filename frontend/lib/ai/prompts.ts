/**
 * 100 creative AI map poster prompt ideas
 * These prompts showcase the range of artistic styles, locations, and customizations possible
 */
export const AI_PROMPT_IDEAS = [
  // === ARTISTIC STYLES ===
  // Japanese/Asian Art
  "Ukiyo-e woodblock print of Kanagawa with traditional indigo and cream",
  "Sumi-e ink wash painting of Kyoto with minimalist black brushstrokes",
  "Cherry blossom spring map of Tokyo in soft pinks and whites",
  "Zen garden inspired map of Nara with raked sand patterns",
  "Traditional Chinese scroll painting of the Great Wall region",

  // Retro/Vintage
  "1920s Art Deco Manhattan in gold and black, Gatsby vibes",
  "Vintage airline poster of Paris with retro typography",
  "1950s travel poster of Rome in faded Mediterranean colors",
  "Antique explorer's map of the Amazon on aged parchment",
  "Hand-drawn treasure map of the Caribbean with compass rose",
  "Victorian-era London with sepia tones and ornate borders",
  "1960s psychedelic San Francisco with swirling rainbow colors",
  "Retro 70s disco Miami with orange sunsets and palm silhouettes",
  "1980s neon arcade Tokyo with pixel-inspired grid lines",
  "Mid-century modern Copenhagen in mustard and teal",

  // Cyberpunk/Sci-Fi
  "Blade Runner-inspired neon map of Tokyo with hot pink and cyan",
  "Cyberpunk 2077 style Night City vibes for Los Angeles",
  "Tron-inspired digital grid of Singapore with glowing blue lines",
  "Matrix code rain overlay on downtown Seattle",
  "Dystopian sci-fi Chicago with dark grays and acid green accents",
  "Holographic iridescent map of Dubai floating in space",
  "Alien world cartography of Death Valley in otherworldly purples",

  // Vaporwave/Synthwave
  "Vaporwave Miami Beach with pink sunsets and teal ocean vibes",
  "Synthwave sunset over Los Angeles with purple mountains",
  "Outrun aesthetic San Diego with palm tree silhouettes",
  "Retrowave Phoenix with hot pink and electric blue",
  "A E S T H E T I C Tokyo with marble statues and Greek columns overlay",

  // Nature/Organic
  "Watercolor botanical garden map of Kew Gardens",
  "Forest floor moss and fern textures for Pacific Northwest",
  "Autumn foliage map of Vermont in warm oranges and reds",
  "Desert sand dune textures for Sahara with golden hour lighting",
  "Arctic ice and aurora borealis map of Reykjavik",
  "Tropical rainforest canopy view of Costa Rica",
  "Lavender fields of Provence in soft purples and greens",
  "Coral reef inspired map of the Great Barrier Reef coast",

  // Architectural/Technical
  "Blueprint technical drawing of Washington DC with white lines",
  "Architectural elevation map of Barcelona's Gothic Quarter",
  "CAD wireframe of downtown Chicago's skyscrapers",
  "Isometric pixel art of Tokyo's Shibuya crossing",
  "3D architectural model of Rome's ancient ruins",
  "Cross-section geological map of the Grand Canyon",

  // Dark/Moody
  "Gothic dark academia Oxford with sepia tones and old paper texture",
  "Film noir rainy night in Seattle with dramatic shadows",
  "Haunted Victorian map of New Orleans in midnight blues",
  "Dark forest fairy tale map of the Black Forest, Germany",
  "Mysterious foggy San Francisco in muted grays and silver",
  "Eclipse shadow map of totality path across America",
  "Vampire's Transylvania in blood reds and gothic blacks",

  // Bright/Cheerful
  "Pop art explosion of London in Warhol primary colors",
  "Candy-colored pastel map of Copenhagen",
  "Rainbow pride celebration map of San Francisco",
  "Confetti celebration map of Rio de Janeiro",
  "Ice cream parlor pastels for Coney Island",
  "Bubblegum pink and mint green Palm Springs",

  // === 3D AND TERRAIN ===
  "Epic 3D Rocky Mountains with snow-capped peaks, 60° pitch view",
  "3D Swiss Alps with dramatic terrain exaggeration and contour lines",
  "3D isometric Manhattan at night with glowing amber skyscrapers",
  "Dramatic 3D Grand Canyon sunrise with deep shadows",
  "3D Mount Fuji with traditional Japanese cloud patterns",
  "Topographic relief of Hawaii's volcanic islands",
  "3D Himalayan peaks with prayer flag colors",
  "Cinematic 3D San Francisco hills at golden hour",
  "3D Norwegian fjords with deep blue waters",
  "Dramatic cliff-side 3D view of Santorini",

  // === SPECIFIC LOCATIONS ===
  // Cities
  "Minimalist line art of Paris focusing on the Seine's curves",
  "Abstract geometric interpretation of Barcelona's grid",
  "Infrared heat vision map of Los Angeles at night",
  "Bauhaus geometric Berlin in primary colors - red, yellow, blue",
  "Art nouveau Prague with ornate floral borders",
  "Mondrian-inspired grid of Manhattan in primary colors",
  "Impressionist brushstroke map of Monet's Giverny",
  "Pointillist dots map of Amsterdam's canals",
  "Cubist fragmented view of Picasso's Barcelona",
  "Street art graffiti style of Brooklyn",
  "Stained glass cathedral style of Notre Dame's Paris",
  "Origami paper fold texture map of Tokyo",
  "Terrazzo pattern map of Milan",

  // Natural Wonders
  "Bioluminescent ocean glow map of Puerto Rico's bays",
  "Northern lights dancing over Tromsø, Norway",
  "Volcanic lava flow map of Hawaii's Big Island in reds and oranges",
  "Crystal cave inspired map of Naica, Mexico",
  "Salt flat mirror reflection of Salar de Uyuni, Bolivia",
  "Redwood forest scale comparison of Sequoia National Park",
  "Meteor crater topography of Arizona",
  "Geyser steam and thermal pools of Yellowstone",

  // === THEMED/OCCASIONS ===
  "Wedding anniversary map of where we first met, elegant gold script",
  "Birth announcement map of our hometown with baby footprints",
  "Marathon route celebration map with runner's path highlighted",
  "College campus nostalgia map in school colors",
  "Honeymoon destination map with romantic sunset palette",
  "Road trip route map in vintage gas station aesthetic",
  "Where we got engaged - romantic twilight cityscape",
  "First home together - cozy neighborhood in warm tones",

  // === ABSTRACT/EXPERIMENTAL ===
  "Glitch art distorted map of downtown with RGB separation",
  "Thermal imaging satellite view of urban heat islands",
  "Sound wave visualization of a city's noise pollution",
  "Population density as topographic peaks",
  "Traffic flow as abstract light trails",
  "Negative space focus - only show water and parks",
  "Constellation star map overlay on city lights",
  "Invisible cities - Italo Calvino inspired abstract interpretation",
  "Data visualization of coffee shops as heat map",
] as const;

/**
 * Get a random selection of prompts
 * @param count Number of prompts to return
 * @returns Array of randomly selected prompts
 */
export function getRandomPrompts(count: number = 10): string[] {
  const shuffled = [...AI_PROMPT_IDEAS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
