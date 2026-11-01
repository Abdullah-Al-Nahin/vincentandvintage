export const INITIAL_CATEGORIES = [
  {
    id: 1,
    name: "OLD MONEY SHIRT",
    slug: "old-money-shirt",
    cardImage: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=85",
    bannerImage: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&w=1600&q=85",
  },
  {
    id: 2,
    name: "REMI COTTON SHIRT",
    slug: "remi-cotton-shirt",
    cardImage: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=85",
    bannerImage: "https://images.unsplash.com/photo-1602810316693-3667c854239a?auto=format&fit=crop&w=1600&q=85",
  },
  {
    id: 3,
    name: "KNITTED POLO",
    slug: "knitted-polo",
    cardImage: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=800&q=85",
    bannerImage: "https://images.unsplash.com/photo-1626557981101-aae6f84aa6ff?auto=format&fit=crop&w=1600&q=85",
  },
  {
    id: 4,
    name: "BOOTCUT GURKHA PANT",
    slug: "bootcut-gurkha-pant",
    cardImage: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=85",
    bannerImage: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1600&q=85",
  },
  {
    id: 5,
    name: "PANJABI",
    slug: "panjabi",
    cardImage: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=85",
    bannerImage: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1600&q=85",
  },
  {
    id: 6,
    name: "DROP SHOULDER T-SHIRT",
    slug: "drop-shoulder-tshirt",
    cardImage: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=85",
    bannerImage: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1600&q=85",
  },
  {
    id: 7,
    name: "HALF SLEEVE SHIRT",
    slug: "half-sleeve-shirt",
    cardImage: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=85",
    bannerImage: "https://images.unsplash.com/photo-1598032895397-b9472444bf93?auto=format&fit=crop&w=1600&q=85",
  },
  {
    id: 8,
    name: "ACCESSORIES",
    slug: "accessories",
    cardImage: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=85",
    bannerImage: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1600&q=85",
  }
];

export const INITIAL_HERO_SLIDES = [
  {
    id: 1,
    title: "OLD MONEY HERITAGE COLLECTION",
    subtitle: "VINCENT & VINTAGE • FEEL THE STYLE",
    badge: "NEW SEASON 2026",
    ctaText: "EXPLORE COLLECTION",
    link: "/shop?category=old-money-shirt",
    image: "/brand/cover.jpg",
  },
  {
    id: 2,
    title: "LUXURY KNITTED POLO EDITION",
    subtitle: "PREMIUM QUALITY || COMFORT || CLASSY",
    badge: "FLAT 25% OFF",
    ctaText: "SHOP KNITTED POLOS",
    link: "/shop?category=knitted-polo",
    image: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&w=1920&q=85",
  },
  {
    id: 3,
    title: "SIGNATURE GURKHA & FORMAL TROUSERS",
    subtitle: "BESPOKE TAILORING FOR MODERN GENTLEMEN",
    badge: "BEST SELLER",
    ctaText: "DISCOVER GURKHA PANTS",
    link: "/shop?category=bootcut-gurkha-pant",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1920&q=85",
  }
];

export const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: "Textured Old Money Cuban Collar Shirt | VV-101",
    slug: "textured-old-money-cuban-collar-shirt-vv-101",
    sku: "VV-101",
    category: "Old Money Shirt",
    categorySlug: "old-money-shirt",
    regularPrice: 1850,
    salePrice: 1390,
    fabric: "100% Premium Textured Linen-Cotton Blend (190 GSM)",
    description: "Crafted for the timeless Old Money aesthetic. Features a relaxed Cuban lapel collar, breathable textured weave, mother-of-pearl style buttons, and tailored drape suited for Bangladesh's climate.",
    primaryImage: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=85",
    hoverImage: "https://images.unsplash.com/photo-1602810316693-3667c854239a?auto=format&fit=crop&w=800&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=85",
      "https://images.unsplash.com/photo-1602810316693-3667c854239a?auto=format&fit=crop&w=800&q=85"
    ],
    sizes: [
      { size: "M", chest: "40", length: "28", stock: 14 },
      { size: "L", chest: "42", length: "29", stock: 18 },
      { size: "XL", chest: "44", length: "30", stock: 9 },
      { size: "XXL", chest: "46", length: "31", stock: 6 }
    ],
    colors: [
      { name: "Sage Olive", hex: "#546354" },
      { name: "Ivory Cream", hex: "#F5F2EB" },
      { name: "Espresso Brown", hex: "#46351F" }
    ],
    rating: 4.9,
    reviewsCount: 42,
    isBestSeller: true,
    isNewArrival: true,
    isTodaysDeal: false
  },
  {
    id: 2,
    name: "Vintage Ribbed Knitted Polo Shirt | VV-204",
    slug: "vintage-ribbed-knitted-polo-shirt-vv-204",
    sku: "VV-204",
    category: "Knitted Polo",
    categorySlug: "knitted-polo",
    regularPrice: 1650,
    salePrice: 1250,
    fabric: "Fine Gauge Combed Cotton Knit (220 GSM)",
    description: "Signature Vincent & Vintage vertical-ribbed knitted polo with contrast tipped collar and cuffs. Ultra-soft handfeel with structured shoulders for a sharp silhouette.",
    primaryImage: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=800&q=85",
    hoverImage: "https://images.unsplash.com/photo-1626557981101-aae6f84aa6ff?auto=format&fit=crop&w=800&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=800&q=85",
      "https://images.unsplash.com/photo-1626557981101-aae6f84aa6ff?auto=format&fit=crop&w=800&q=85"
    ],
    sizes: [
      { size: "M", chest: "39", length: "27.5", stock: 12 },
      { size: "L", chest: "41", length: "28.5", stock: 15 },
      { size: "XL", chest: "43", length: "29.5", stock: 11 },
      { size: "XXL", chest: "45", length: "30.5", stock: 4 }
    ],
    colors: [
      { name: "Warm Bronze", hex: "#B89579" },
      { name: "Charcoal Black", hex: "#212121" }
    ],
    rating: 4.8,
    reviewsCount: 37,
    isBestSeller: true,
    isNewArrival: true,
    isTodaysDeal: true
  },
  {
    id: 3,
    name: "Pure Remi Cotton Executive Formal Shirt | VV-112",
    slug: "pure-remi-cotton-executive-formal-shirt-vv-112",
    sku: "VV-112",
    category: "Remi Cotton Shirt",
    categorySlug: "remi-cotton-shirt",
    regularPrice: 1750,
    salePrice: 1350,
    fabric: "100% Export-Grade Remi Cotton",
    description: "Crisp, breathable Remi cotton shirt engineered for all-day comfort and classy presentation. Features reinforced collar stays and wrinkle-resistant finish.",
    primaryImage: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=85",
    hoverImage: "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=800&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=85",
      "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=800&q=85"
    ],
    sizes: [
      { size: "M", chest: "40", length: "28.5", stock: 20 },
      { size: "L", chest: "42", length: "29.5", stock: 16 },
      { size: "XL", chest: "44", length: "30.5", stock: 10 },
      { size: "XXL", chest: "46", length: "31", stock: 7 }
    ],
    colors: [
      { name: "Oxford Sky", hex: "#C8D9E6" },
      { name: "Classic White", hex: "#FFFFFF" }
    ],
    rating: 4.7,
    reviewsCount: 29,
    isBestSeller: true,
    isNewArrival: false,
    isTodaysDeal: false
  },
  {
    id: 4,
    name: "Sartorial High-Waist Bootcut Gurkha Pant | VV-305",
    slug: "sartorial-high-waist-bootcut-gurkha-pant-vv-305",
    sku: "VV-305",
    category: "Bootcut Gurkha Pant",
    categorySlug: "bootcut-gurkha-pant",
    regularPrice: 2250,
    salePrice: 1690,
    fabric: "Premium Twill Gabardine with 2% Elastane Stretch",
    description: "Double-pleated Italian-style Gurkha waistband with adjustable side buckles. Tailored with a subtle bootcut flare for an elongated, aristocratic silhouette.",
    primaryImage: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=85",
    hoverImage: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=85",
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=85"
    ],
    sizes: [
      { size: "M", chest: "30-31 Waist", length: "40", stock: 10 },
      { size: "L", chest: "32-33 Waist", length: "40.5", stock: 15 },
      { size: "XL", chest: "34-35 Waist", length: "41", stock: 12 },
      { size: "XXL", chest: "36-38 Waist", length: "41.5", stock: 8 }
    ],
    colors: [
      { name: "Sand Beige", hex: "#D6C5B3" },
      { name: "Obsidian Black", hex: "#1B1B1B" }
    ],
    rating: 4.9,
    reviewsCount: 54,
    isBestSeller: true,
    isNewArrival: true,
    isTodaysDeal: true
  },
  {
    id: 5,
    name: "Royal Embroidered Heritage Panjabi | VV-501",
    slug: "royal-embroidered-heritage-panjabi-vv-501",
    sku: "VV-501",
    category: "Panjabi",
    categorySlug: "panjabi",
    regularPrice: 2850,
    salePrice: 2190,
    fabric: "Egyptian Giza Cotton with Tonal Zari Embroidery",
    description: "Designed for Jummah, weddings, and festive occasions. Features intricate tonal embroidery along the mandarin collar and placket with custom metallic buttons.",
    primaryImage: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=85",
    hoverImage: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=85",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=85"
    ],
    sizes: [
      { size: "M", chest: "40", length: "40", stock: 9 },
      { size: "L", chest: "42", length: "42", stock: 14 },
      { size: "XL", chest: "44", length: "44", stock: 11 },
      { size: "XXL", chest: "46", length: "45", stock: 5 }
    ],
    colors: [
      { name: "Deep Forest", hex: "#2A3B2C" },
      { name: "Royal Bronze", hex: "#A98153" }
    ],
    rating: 4.9,
    reviewsCount: 61,
    isBestSeller: true,
    isNewArrival: true,
    isTodaysDeal: false
  },
  {
    id: 6,
    name: "220+ GSM Acid Wash Drop Shoulder Tee | VV-701",
    slug: "220-gsm-acid-wash-drop-shoulder-tee-vv-701",
    sku: "VV-701",
    category: "Drop Shoulder T-Shirt",
    categorySlug: "drop-shoulder-tshirt",
    regularPrice: 1150,
    salePrice: 790,
    fabric: "220+ GSM Heavyweight French Terry Cotton",
    description: "Vintage enzyme acid-washed drop shoulder oversized t-shirt with thick Lycra ribbed crew neck that never loses shape.",
    primaryImage: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=85",
    hoverImage: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=85",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=85"
    ],
    sizes: [
      { size: "M", chest: "42", length: "28", stock: 22 },
      { size: "L", chest: "44", length: "29", stock: 19 },
      { size: "XL", chest: "46", length: "30", stock: 12 },
      { size: "XXL", chest: "48", length: "31", stock: 6 }
    ],
    colors: [
      { name: "Vintage Slate", hex: "#4A4F55" },
      { name: "Washed Olive", hex: "#596353" }
    ],
    rating: 4.8,
    reviewsCount: 33,
    isBestSeller: false,
    isNewArrival: true,
    isTodaysDeal: true
  },
  {
    id: 7,
    name: "Resort Striped Half Sleeve Casual Shirt | VV-408",
    slug: "resort-striped-half-sleeve-casual-shirt-vv-408",
    sku: "VV-408",
    category: "Half Sleeve Shirt",
    categorySlug: "half-sleeve-shirt",
    regularPrice: 1550,
    salePrice: 1190,
    fabric: "Soft Slub Viscose-Cotton Blend (165 GSM)",
    description: "Effortless vertical resort stripes with an airy relaxed fit. Ideal for summer evenings, travel, and smart-casual weekend wear.",
    primaryImage: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=85",
    hoverImage: "https://images.unsplash.com/photo-1598032895397-b9472444bf93?auto=format&fit=crop&w=800&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=85",
      "https://images.unsplash.com/photo-1598032895397-b9472444bf93?auto=format&fit=crop&w=800&q=85"
    ],
    sizes: [
      { size: "M", chest: "40", length: "28", stock: 11 },
      { size: "L", chest: "42", length: "29", stock: 15 },
      { size: "XL", chest: "44", length: "30", stock: 8 },
      { size: "XXL", chest: "46", length: "30.5", stock: 5 }
    ],
    colors: [
      { name: "Mocha Stripe", hex: "#8B6F56" },
      { name: "Sage Stripe", hex: "#6B7B6E" }
    ],
    rating: 4.7,
    reviewsCount: 21,
    isBestSeller: false,
    isNewArrival: true,
    isTodaysDeal: false
  },
  {
    id: 8,
    name: "Full-Grain Vintage Leather Bifold Wallet | VV-902",
    slug: "full-grain-vintage-leather-bifold-wallet-vv-902",
    sku: "VV-902",
    category: "Accessories",
    categorySlug: "accessories",
    regularPrice: 1450,
    salePrice: 990,
    fabric: "100% Vegetable-Tanned Full-Grain Cowhide Leather",
    description: "Hand-stitched full-grain leather wallet embossed with the Vincent & Vintage crest. Develops a rich patina over time. Comes in a signature wooden gift box.",
    primaryImage: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=85",
    hoverImage: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=85",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=85"
    ],
    sizes: [
      { size: "Standard", chest: "4.5 x 3.7 in", length: "8 Card Slots", stock: 25 }
    ],
    colors: [
      { name: "Cognac Tan", hex: "#9A6238" },
      { name: "Dark Espresso", hex: "#3B281E" }
    ],
    rating: 4.9,
    reviewsCount: 48,
    isBestSeller: true,
    isNewArrival: false,
    isTodaysDeal: false
  }
];
