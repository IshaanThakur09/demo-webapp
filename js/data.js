// Komorebi Cafe - Data Repository & WhatsApp Configuration

const CAFE_INFO = {
  name: "Komorebi Cafe",
  tagline: "A cozy neighborhood sanctuary for slow mornings, ceremonial matcha & artisanal bakes.",
  address: "742 Evergreen Nook, West Village, NY 10014",
  phone: "(555) 234-8901",
  whatsappNumber: "15552348901", // International format for wa.me link
  whatsappDisplay: "+1 (555) 234-8901",
  email: "hello@komorebicafe.com",
  geo: {
    latitude: 40.7336,
    longitude: -74.0027
  },
  hours: {
    weekday: "7:30 AM - 7:00 PM",
    weekend: "8:00 AM - 8:00 PM",
    openHour: 7,
    openMinute: 30,
    closeHour: 19,
    closeMinute: 0
  }
};

const MENU_CATEGORIES = [
  { id: "all", name: "All Items", icon: "✨" },
  { id: "coffee", name: "Artisanal Coffee", icon: "☕" },
  { id: "matcha-tea", name: "Matcha & Teas", icon: "🍵" },
  { id: "bakery", name: "Fresh Bakes", icon: "🥐" },
  { id: "brunch", name: "Cozy Brunch", icon: "🍳" }
];

const MENU_ITEMS = [
  {
    id: "item-1",
    name: "Iced Ceremonial Uji Matcha",
    category: "matcha-tea",
    price: 6.75,
    description: "First-harvest Uji ceremonial matcha whisked fresh with velvety oat milk and organic maple syrup.",
    tags: ["House Favorite", "Vegan", "GF"],
    image: "images/matcha.jpg",
    highlights: "Organic Uji Matcha • Hand Whisked"
  },
  {
    id: "item-2",
    name: "Cardamom Cinnamon Brown Sugar Latte",
    category: "coffee",
    price: 6.50,
    description: "Double shot of single-origin espresso infused with hand-ground cardamom and house-made brown sugar syrup.",
    tags: ["House Favorite", "Popular"],
    image: "images/hero.jpg",
    highlights: "Single Origin • House Syrup"
  },
  {
    id: "item-3",
    name: "Butter Flake Almond Croissant",
    category: "bakery",
    price: 5.25,
    description: "Twice-baked butter croissant filled with rich almond frangipane cream and topped with toasted almonds.",
    tags: ["Freshly Baked"],
    image: "images/pastries.jpg",
    highlights: "Baked Fresh at 6:30 AM Daily"
  },
  {
    id: "item-4",
    name: "Avocado & Microgreen Tartine",
    category: "brunch",
    price: 12.50,
    description: "Smashed Haas avocado on toasted artisan sourdough with radish, pumpkin seed dukkah, and microgreens.",
    tags: ["Vegan", "Nutritious"],
    image: "images/corner.jpg",
    highlights: "Local Organic Microgreens"
  },
  {
    id: "item-5",
    name: "Honey Processed Cold Brew",
    category: "coffee",
    price: 5.75,
    description: "Slow-steeped 18-hour cold brew crafted from Costa Rican beans with natural notes of orange blossom and clover honey.",
    tags: ["Vegan", "GF"],
    image: "images/hero.jpg",
    highlights: "18-Hour Slow Extraction"
  },
  {
    id: "item-6",
    name: "Hojicha Roasted Milk Tea",
    category: "matcha-tea",
    price: 6.25,
    description: "Roasted green tea with warm nutty caramel undertones, steeped in steamed oat or whole milk.",
    tags: ["Low Caffeine", "Cozy Pick"],
    image: "images/matcha.jpg",
    highlights: "Kyoto Roasted Tea Leaves"
  },
  {
    id: "item-7",
    name: "Pistachio & Rosewater Cardamom Bun",
    category: "bakery",
    price: 5.75,
    description: "Soft twisted brioche dough rolled with crushed roasted pistachios, cardamoms, and finished with rosewater glaze.",
    tags: ["House Favorite"],
    image: "images/pastries.jpg",
    highlights: "Hand-rolled Daily"
  },
  {
    id: "item-8",
    name: "Truffled Wild Mushroom Toast",
    category: "brunch",
    price: 13.75,
    description: "Pan-roasted maitake & cremini mushrooms over whipped garlic ricotta on country sourdough with white truffle oil.",
    tags: ["Vegetarian"],
    image: "images/corner.jpg",
    highlights: "Artisanal Ricotta & Truffle"
  },
  {
    id: "item-9",
    name: "Lavender Earl Grey Fog",
    category: "matcha-tea",
    price: 6.00,
    description: "Organic Earl Grey tea steeped with culinary French lavender, combined with vanilla bean syrup and oat milk.",
    tags: ["Cozy Pick", "GF"],
    image: "images/matcha.jpg",
    highlights: "French Culinary Lavender"
  },
  {
    id: "item-10",
    name: "Single-Origin Pour Over (Ethiopia Yirgacheffe)",
    category: "coffee",
    price: 6.00,
    description: "Hand-poured filter coffee highlighting delicate floral jasmines, bergamot citrus, and sweet blueberry finish.",
    tags: ["Vegan", "GF", "Specialty"],
    image: "images/hero.jpg",
    highlights: "Hand Poured • Single Origin"
  },
  {
    id: "item-11",
    name: "Miso Caramel Chocolate Chip Cookie",
    category: "bakery",
    price: 4.50,
    description: "Chewy dark chocolate cookie infused with white miso for savory-sweet depth, topped with Maldon sea salt.",
    tags: ["Popular"],
    image: "images/pastries.jpg",
    highlights: "Maldon Sea Salt Flakes"
  },
  {
    id: "item-12",
    name: "Cloud Soufflé Pancakes",
    category: "brunch",
    price: 14.50,
    description: "Ultra-fluffy Japanese soufflé pancakes served with whipped salted honey butter, fresh berries, and maple syrup.",
    tags: ["Popular", "House Favorite"],
    image: "images/corner.jpg",
    highlights: "Made Fresh to Order"
  }
];

window.CAFE_INFO = CAFE_INFO;
window.MENU_CATEGORIES = MENU_CATEGORIES;
window.MENU_ITEMS = MENU_ITEMS;

export { CAFE_INFO, MENU_CATEGORIES, MENU_ITEMS };
