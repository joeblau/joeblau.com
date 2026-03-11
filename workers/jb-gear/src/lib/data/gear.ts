export enum Category {
  Displays = "Displays",
  Camera = "Camera",
  Audio = "Audio",
  Desk = "Desk",
  Computing = "Computing",
  Accessories = "Accessories",
}

export interface GearItem {
  name: string;
  category: Category;
  price: number;
  image: string;
  url: string;
  description?: string;
}

export const gearItems: GearItem[] = [
  // Displays
  {
    name: "Apple Pro Display XDR",
    category: Category.Displays,
    price: 4999,
    image: "/gear/pro-display-xdr.png",
    url: "https://www.apple.com/pro-display-xdr/",
    description: "32-inch 6K Retina display",
  },
  {
    name: "Apple Pro Display XDR",
    category: Category.Displays,
    price: 4999,
    image: "/gear/pro-display-xdr.png",
    url: "https://www.apple.com/pro-display-xdr/",
    description: "32-inch 6K Retina display",
  },
  // Camera
  {
    name: "ZEISS Supreme Prime CP.3 25mm",
    category: Category.Camera,
    price: 4990,
    image: "/gear/zeiss-cp3.png",
    url: "https://www.zeiss.com/consumer-products/us/cinematography/cp3.html",
    description: "T2.1 Cinema lens",
  },
  {
    name: "Sony ZV-E1",
    category: Category.Camera,
    price: 2198,
    image: "/gear/sony-zv-e1.png",
    url: "https://www.sony.com/en/interchangeable-lens-cameras/products/ilce-zve1",
    description: "Full-frame vlog camera",
  },
  // Audio
  {
    name: "Schoeps CMC 1 L",
    category: Category.Audio,
    price: 1870,
    image: "/gear/schoeps-cmc1.png",
    url: "https://schoeps.de/en/products/colette/cmc-1.html",
    description: "Modular condenser microphone amplifier",
  },
  {
    name: "Schoeps MK 4",
    category: Category.Audio,
    price: 1310,
    image: "/gear/schoeps-mk4.png",
    url: "https://schoeps.de/en/products/colette/mk-4.html",
    description: "Cardioid capsule",
  },
  {
    name: "Apple HomePod",
    category: Category.Audio,
    price: 299,
    image: "/gear/homepod.png",
    url: "https://www.apple.com/homepod/",
    description: "Smart speaker with spatial audio",
  },
  {
    name: "Apple HomePod",
    category: Category.Audio,
    price: 299,
    image: "/gear/homepod.png",
    url: "https://www.apple.com/homepod/",
    description: "Smart speaker with spatial audio",
  },
  {
    name: "Yellowtec Mika",
    category: Category.Audio,
    price: 549,
    image: "/gear/yellowtec-mika.png",
    url: "https://www.yellowtec.com/mika.html",
    description: "Premium microphone arm",
  },
  {
    name: "Lewitt LCT 240 PRO",
    category: Category.Audio,
    price: 269,
    image: "/gear/lewitt-lct240.png",
    url: "https://www.lewitt-audio.com/microphones/lct-240-pro",
    description: "Studio condenser microphone",
  },
  {
    name: "Beyerdynamic DT 1990 Pro",
    category: Category.Audio,
    price: 599,
    image: "/gear/beyerdynamic-dt1990.png",
    url: "https://www.beyerdynamic.com/dt-1990-pro.html",
    description: "Open-back studio headphones",
  },
  // Desk
  {
    name: "Deskhaus Apex Pro",
    category: Category.Desk,
    price: 899,
    image: "/gear/deskhaus-frame.png",
    url: "https://desk.haus/products/apex-pro",
    description: "Standing desk frame",
  },
  {
    name: "Deskhaus Butcher Block Surface",
    category: Category.Desk,
    price: 399,
    image: "/gear/deskhaus-surface.png",
    url: "https://desk.haus/",
    description: "Solid wood desktop surface",
  },
  {
    name: "Deskhaus Wire Snake",
    category: Category.Desk,
    price: 49,
    image: "/gear/deskhaus-wiresnake.png",
    url: "https://desk.haus/",
    description: "Cable management spine",
  },
  // Computing
  {
    name: "MacBook Pro M3 Max",
    category: Category.Computing,
    price: 3499,
    image: "/gear/macbook-pro-m3.png",
    url: "https://www.apple.com/macbook-pro/",
    description: '16" laptop with M3 Max chip',
  },
  // Accessories
  {
    name: "Ergotron HX Dual Monitor Arm",
    category: Category.Accessories,
    price: 649,
    image: "/gear/ergotron-hx.png",
    url: "https://www.ergotron.com/en-us/products/product-details/45-476-224",
    description: "Heavy-duty dual monitor mount",
  },
  {
    name: "Elgato Stream Deck +",
    category: Category.Accessories,
    price: 199,
    image: "/gear/stream-deck-plus.png",
    url: "https://www.elgato.com/us/en/p/stream-deck-plus-black",
    description: "Customizable LCD control panel",
  },
  {
    name: "Brydge SP Max+",
    category: Category.Accessories,
    price: 399,
    image: "/gear/brydge-sp-max.png",
    url: "https://www.brydge.com/products/brydge-sp-max-plus",
    description: "Thunderbolt docking station",
  },
  {
    name: "Elgato Key Light",
    category: Category.Accessories,
    price: 199,
    image: "/gear/elgato-keylight.png",
    url: "https://www.elgato.com/us/en/p/key-light",
    description: "Professional studio light",
  },
  {
    name: "Elgato Key Light",
    category: Category.Accessories,
    price: 199,
    image: "/gear/elgato-keylight.png",
    url: "https://www.elgato.com/us/en/p/key-light",
    description: "Professional studio light",
  },
  {
    name: "Nomad Stand One Max",
    category: Category.Accessories,
    price: 150,
    image: "/gear/nomad-stand-one.png",
    url: "https://nomadgoods.com/products/stand-one-max-3-in-1-carbide",
    description: "3-in-1 MagSafe charger",
  },
];

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function calculateTotal(items: GearItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

export function getItemCountByCategory(
  items: GearItem[],
  category: Category
): number {
  return items.filter((item) => item.category === category).length;
}

export const allCategories = Object.values(Category);
