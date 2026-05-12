//Hardcoded sample data for species profiles. In a real app, this would likely come from an API or database, this hardcode data is mainly used when developing or testing the application.
export interface Species {
  id: string;
  name: string;
  scientificName: string;
  category: "fish" | "turtle";
  imageUrl: string;
  adultSize: string;
  lifespan: string;
  careDifficulty: "Beginner" | "Intermediate" | "Advanced";
  biodiversityRisk: "Low" | "Medium" | "High";
  shortDesc: string;
  legalAlerts: string[];
  healthChecklist: string[];
  careTips: { title: string; desc: string }[];
  isFeatured: boolean;

  // New requirements for screening
  minBudget: "low" | "medium" | "high";
  minSpace: "small" | "medium" | "large";
  minTime: "low" | "medium" | "high";
  minExperience: "beginner" | "intermediate" | "advanced";
}

export const speciesData: Species[] = [
  {
    id: "red-eared-slider",
    name: "Red-Eared Slider",
    scientificName: "Trachemys scripta elegans",
    category: "turtle",
    imageUrl:
      "https://images.unsplash.com/photo-1774266870873-38dd0d11b547?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWQlMjBlYXJlZCUyMHNsaWRlciUyMHR1cnRsZSUyMGluJTIwd2F0ZXJ8ZW58MXx8fHwxNzc0NzE4NTcxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    adultSize: "20cm - 30cm (Dinner plate size)",
    lifespan: "20 - 30 years",
    careDifficulty: "Intermediate",
    biodiversityRisk: "High",
    shortDesc:
      "A very common pet turtle that starts small and cute but grows quickly. They are highly invasive if released into Malaysian waterways.",
    legalAlerts: [
      "Do not release into the wild. They outcompete native turtles for food and basking spots.",
      "Regulated in many countries as an invasive species.",
    ],
    healthChecklist: [
      "Shell is firm, not soft or peeling excessively",
      "Eyes are clear and open, not swollen",
      "Active swimming, not floating sideways",
      "Eats enthusiastically",
    ],
    careTips: [
      {
        title: "Tank Size",
        desc: "Needs at least a 100-gallon (380L) tank as an adult.",
      },
      {
        title: "Basking Area",
        desc: "Requires a dry dock with both heat and UVB lighting.",
      },
      {
        title: "Filtration",
        desc: "They are very messy; require a strong canister filter.",
      },
    ],
    isFeatured: true,
    minBudget: "high",
    minSpace: "large",
    minTime: "medium",
    minExperience: "intermediate",
  },
  {
    id: "common-musk-turtle",
    name: "Common Musk Turtle",
    scientificName: "Sternotherus odoratus",
    category: "turtle",
    imageUrl:
      "https://images.unsplash.com/photo-1739257453817-906e882bb95f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFsbCUyMHR1cnRsZSUyMHN3aW1taW5nfGVufDF8fHx8MTc3NDg3NjYzMHww&ixlib=rb-4.1.0&q=80&w=1080",
    adultSize: "10cm - 15cm",
    lifespan: "30 - 50 years",
    careDifficulty: "Beginner",
    biodiversityRisk: "Medium",
    shortDesc:
      "A small, fully aquatic turtle that doesn't outgrow standard aquariums as quickly. A much safer and manageable alternative to the Red-Eared Slider.",
    legalAlerts: [
      "Still a non-native species. Do not release into local lakes or rivers.",
    ],
    healthChecklist: [
      "Shell has no white fuzzy patches (fungus)",
      "Alert and responsive when handled",
      "No bubbles blowing from the nose (sign of respiratory infection)",
    ],
    careTips: [
      {
        title: "Tank Size",
        desc: "A 20-30 gallon tank is usually sufficient for an adult.",
      },
      {
        title: "Water Depth",
        desc: "They are bottom-walkers, so provide driftwood to help them reach the surface easily.",
      },
    ],
    isFeatured: false,
    minBudget: "medium",
    minSpace: "medium",
    minTime: "medium",
    minExperience: "beginner",
  },
  {
    id: "common-pleco",
    name: "Common Pleco (Ikan Bandaraya)",
    scientificName: "Hypostomus plecostomus",
    category: "fish",
    imageUrl:
      "https://images.unsplash.com/photo-1600996529733-65fb09e5a749?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGVjb3N0b211cyUyMHN1Y2tlciUyMGZpc2glMjBhcXVhcml1bXxlbnwxfHx8fDE3NzQ3MTg1NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    adultSize: "30cm - 60cm",
    lifespan: "10 - 15 years",
    careDifficulty: "Intermediate",
    biodiversityRisk: "High",
    shortDesc:
      'Often sold small as "algae eaters", they grow massive and create a lot of waste. Releasing them destroys riverbanks in Malaysia.',
    legalAlerts: [
      "Severe threat to local rivers. They burrow into riverbanks causing erosion and disrupting local fish breeding grounds.",
    ],
    healthChecklist: [
      "Sticks firmly to glass or wood",
      "No white spots (Ich) on the body",
      "Belly is slightly rounded, not sunken",
    ],
    careTips: [
      {
        title: "Space",
        desc: "Needs a massive tank (150+ gallons) or an indoor pond.",
      },
      {
        title: "Diet",
        desc: "Needs sinking algae wafers, vegetables (zucchini), and driftwood to chew on.",
      },
    ],
    isFeatured: true,
    minBudget: "high",
    minSpace: "large",
    minTime: "medium",
    minExperience: "intermediate",
  },
  {
    id: "corydoras",
    name: "Corydoras Catfish",
    scientificName: "Corydoras spp.",
    category: "fish",
    imageUrl:
      "https://images.unsplash.com/photo-1730530355813-fdfb30480141?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3J5ZG9yYXMlMjBjYXRmaXNofGVufDF8fHx8MTc3NDg3NjYxNXww&ixlib=rb-4.1.0&q=80&w=1080",
    adultSize: "5cm - 7cm",
    lifespan: "3 - 5 years",
    careDifficulty: "Beginner",
    biodiversityRisk: "Low",
    shortDesc:
      "A fantastic, small bottom-feeder that cleans up leftover food without growing out of control like a Pleco.",
    legalAlerts: [
      "Low risk to ecosystems, but never release any pet into the wild.",
    ],
    healthChecklist: [
      "Barbels (whiskers) are intact, not worn down",
      "Active foraging behavior",
      "No rapid, stressed breathing at the surface",
    ],
    careTips: [
      {
        title: "Substrate",
        desc: "Use fine sand to prevent their delicate barbels from wearing down.",
      },
      {
        title: "Social Needs",
        desc: "They are schooling fish. Keep them in groups of 6 or more.",
      },
    ],
    isFeatured: false,
    minBudget: "low",
    minSpace: "small",
    minTime: "low",
    minExperience: "beginner",
  },
  {
    id: "oscar-fish",
    name: "Oscar",
    scientificName: "Astronotus ocellatus",
    category: "fish",
    imageUrl:
      "https://images.unsplash.com/photo-1667530901798-7453cf395160?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvc2NhciUyMGZpc2glMjBhcXVhcml1bXxlbnwxfHx8fDE3NzQ4NzY2MTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    adultSize: "25cm - 35cm",
    lifespan: "10 - 15 years",
    careDifficulty: "Advanced",
    biodiversityRisk: "High",
    shortDesc:
      "A highly intelligent and aggressive cichlid. They grow very fast and will eat anything that fits in their mouth.",
    legalAlerts: [
      "Highly predatory if released. Can easily decimate local small fish populations.",
    ],
    healthChecklist: [
      "No holes or pitting in the head (Hole-in-the-Head disease)",
      "Bright, alert eyes",
      "Very aggressive feeding response",
    ],
    careTips: [
      {
        title: "Tank Size",
        desc: "Minimum 75 gallons (280L) for a single adult Oscar.",
      },
      {
        title: "Filtration",
        desc: "They are extremely messy eaters. Heavy-duty canister filtration is a must.",
      },
    ],
    isFeatured: false,
    minBudget: "high",
    minSpace: "large",
    minTime: "high",
    minExperience: "advanced",
  },
  {
    id: "guppy",
    name: "Guppy",
    scientificName: "Poecilia reticulata",
    category: "fish",
    imageUrl:
      "https://images.unsplash.com/photo-1711826950924-4cfd41a1be1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxndXBweSUyMGZpc2glMjBhcXVhcml1bXxlbnwxfHx8fDE3NzQ3MTg1NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    adultSize: "3cm - 5cm",
    lifespan: "1 - 3 years",
    careDifficulty: "Beginner",
    biodiversityRisk: "Medium",
    shortDesc:
      "Colorful, active, and easy to care for. They breed very quickly, so population control in the tank is necessary.",
    legalAlerts: [
      "Do not release into drains or ponds. They breed rapidly and can outcompete native small fish.",
    ],
    healthChecklist: [
      "Active swimming, exploring the tank",
      "Fins are intact, not clamped or torn",
      "Bright coloration",
    ],
    careTips: [
      {
        title: "Tank Size",
        desc: "A 10-gallon (38L) tank is suitable for a small group.",
      },
      {
        title: "Breeding",
        desc: "Keep a ratio of 1 male to 2-3 females to reduce stress.",
      },
    ],
    isFeatured: true,
    minBudget: "low",
    minSpace: "small",
    minTime: "low",
    minExperience: "beginner",
  },
  {
    id: "betta-fish",
    name: "Betta Fish",
    scientificName: "Betta splendens",
    category: "fish",
    imageUrl:
      "https://images.unsplash.com/photo-1610906745360-921a9e9f2215?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZXR0YSUyMGZpc2glMjBhcXVhcml1bXxlbnwxfHx8fDE3NzQ4NzY2MTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    adultSize: "5cm - 7cm",
    lifespan: "2 - 5 years",
    careDifficulty: "Beginner",
    biodiversityRisk: "Low",
    shortDesc:
      "A beautiful, solitary fish that thrives in smaller setups. An excellent, low-risk alternative for small spaces.",
    legalAlerts: [
      "Low biodiversity risk, but never release pet fish into natural waterways.",
    ],
    healthChecklist: [
      "Fins are full and flowing, not torn or clamped",
      "Active, responds to movement outside the tank",
      "No white cottony patches",
    ],
    careTips: [
      {
        title: "Housing",
        desc: "Needs at least a 5-gallon tank with a gentle filter and a heater. Not a tiny bowl!",
      },
      {
        title: "Companions",
        desc: "Males are highly aggressive to each other. Best kept alone or with specific peaceful invertebrates.",
      },
    ],
    isFeatured: false,
    minBudget: "low",
    minSpace: "small",
    minTime: "low",
    minExperience: "beginner",
  },
  {
    id: "neon-tetra",
    name: "Neon Tetra",
    scientificName: "Paracheirodon innesi",
    category: "fish",
    imageUrl:
      "https://images.unsplash.com/photo-1737688670910-084f54254e73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZW9uJTIwdGV0cmElMjBmaXNofGVufDF8fHx8MTc3NDg3NjYxNXww&ixlib=rb-4.1.0&q=80&w=1080",
    adultSize: "2cm - 4cm",
    lifespan: "5 - 8 years",
    careDifficulty: "Beginner",
    biodiversityRisk: "Low",
    shortDesc:
      "A striking, peaceful schooling fish that adds brilliant color to planted tanks. Great for beginners with moderate space.",
    legalAlerts: [
      "Unlikely to survive if released, but introducing foreign diseases to local waters is a major risk.",
    ],
    healthChecklist: [
      "Colors are bright and vivid, not washed out",
      "Swimming steadily with the school",
      "Stomach is not pinched or sunken",
    ],
    careTips: [
      {
        title: "Schooling",
        desc: "Keep in groups of 6 or more to prevent stress and hiding.",
      },
      {
        title: "Water Quality",
        desc: "Requires stable, established water conditions. Avoid placing in brand-new, uncycled tanks.",
      },
    ],
    isFeatured: false,
    minBudget: "medium",
    minSpace: "medium",
    minTime: "low",
    minExperience: "beginner",
  },
  {
    id: "goldfish",
    name: "Goldfish",
    scientificName: "Carassius auratus",
    category: "fish",
    imageUrl:
      "https://images.unsplash.com/photo-1592072467526-0506c6530493?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2xkZmlzaCUyMGFxdWFyaXVtfGVufDF8fHx8MTc3NDcxODU3NXww&ixlib=rb-4.1.0&q=80&w=1080",
    adultSize: "15cm - 30cm",
    lifespan: "10 - 20 years",
    careDifficulty: "Intermediate",
    biodiversityRisk: "High",
    shortDesc:
      'A classic pet that requires much more space and filtration than the common "fishbowl" myth suggests.',
    legalAlerts: [
      "Never release into lakes or rivers. They grow huge, eat native vegetation, and muddy the waters, damaging ecosystems.",
    ],
    healthChecklist: [
      "Swimming upright and smoothly",
      "Gills are red/pink, not inflamed or white",
      "Scales are flat against the body",
    ],
    careTips: [
      {
        title: "No Bowls",
        desc: "Never keep in a bowl. Fancy goldfish need at least 30 gallons (110L); common ones need ponds.",
      },
      {
        title: "Filtration",
        desc: "They produce immense amounts of waste. Oversize your filter.",
      },
    ],
    isFeatured: true,
    minBudget: "medium",
    minSpace: "large",
    minTime: "high",
    minExperience: "intermediate",
  },
];
