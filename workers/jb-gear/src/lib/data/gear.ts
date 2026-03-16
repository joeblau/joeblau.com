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
    description: "Full-frame vlog camera (White)",
  },
  // Audio
  {
    name: "Schoeps V4 U",
    category: Category.Audio,
    price: 2850,
    image: "/gear/schoeps-v4u.png",
    url: "https://schoeps.de/en/products/v4/v4.html",
    description: "Studio vocal microphone (Gray)",
  },
  {
    name: "Schoeps MiniCMIT",
    category: Category.Audio,
    price: 2149,
    image: "/gear/schoeps-minicmit.png",
    url: "https://schoeps.de/en/products/shotgun-microphones/cmit-series/minicmit.html",
    description: "Miniature shotgun microphone (Blue)",
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
    name: "Lewitt CONNECT 6",
    category: Category.Audio,
    price: 269,
    image: "/gear/lewitt-connect6.png",
    url: "https://www.lewitt-audio.com/connect-6",
    description: "USB-C audio interface",
  },
{
    name: "Drop x Beyerdynamic DT 177X GO",
    category: Category.Audio,
    price: 349,
    image: "/gear/beyerdynamic-dt177x.png",
    url: "https://drop.com/buy/massdrop-x-beyerdynamic-dt177x-go-headphones",
    description: "Closed-back portable headphones",
  },
  // Desk
  {
    name: "Deskhaus Apex Pro",
    category: Category.Desk,
    price: 899,
    image: "/gear/deskhaus-frame.png",
    url: "https://desk.haus/products/apex-pro-2?variant=39436448661653",
    description: "Standing desk frame",
  },
  {
    name: "Deskhaus HPL Surface",
    category: Category.Desk,
    price: 399,
    image: "/gear/deskhaus-surface.png",
    url: "https://desk.haus/products/high-pressure-laminate-surface",
    description: "High pressure laminate desktop (Brite White)",
  },
  {
    name: "Deskhaus Wire Snake",
    category: Category.Desk,
    price: 49,
    image: "/gear/deskhaus-wiresnake.png",
    url: "https://desk.haus/",
    description: "Cable management spine",
  },
  {
    name: "HÅG Capisco 8106",
    category: Category.Desk,
    price: 1599,
    image: "/gear/hag-capisco-8106.jpg",
    url: "https://hag-office.com/products/capisco-8106",
    description: "Ergonomic saddle chair (White)",
  },
  // Computing
  {
    name: "MacBook Air M2",
    category: Category.Computing,
    price: 1099,
    image: "/gear/macbook-air-m2.png",
    url: "https://www.apple.com/macbook-air-m2/",
    description: '13" laptop with M2 chip (Midnight)',
  },
  {
    name: "MacBook Pro M3 Max",
    category: Category.Computing,
    price: 3499,
    image: "/gear/macbook-pro-m3.png",
    url: "https://www.apple.com/macbook-pro/",
    description: '14" laptop with M3 Max chip (Silver)',
  },
  {
    name: "iPad Pro 13-inch M4",
    category: Category.Computing,
    price: 1299,
    image: "/gear/ipad-pro-m4.png",
    url: "https://www.apple.com/ipad-pro/",
    description: "13-inch Ultra Retina XDR display (Silver)",
  },
  {
    name: "Magic Keyboard for iPad Pro",
    category: Category.Computing,
    price: 349,
    image: "/gear/magic-keyboard-ipad.png",
    url: "https://www.apple.com/shop/product/MWR43LL/A/magic-keyboard-for-ipad-pro-13-inch-m4",
    description: "iPad Pro keyboard with trackpad (White)",
  },
  {
    name: "iPhone Air",
    category: Category.Computing,
    price: 799,
    image: "/gear/iphone-air.png",
    url: "https://www.apple.com/iphone-air/",
    description: "Ultralight smartphone (Cloud White)",
  },
  {
    name: "iPhone 17 Pro",
    category: Category.Computing,
    price: 1199,
    image: "/gear/iphone-17-pro.png",
    url: "https://www.apple.com/iphone-17-pro/",
    description: '6.3" Pro smartphone (Deep Blue)',
  },
  {
    name: "Nomad Stand One",
    category: Category.Accessories,
    price: 119,
    image: "/gear/nomad-stand-one.png",
    url: "https://nomadgoods.com/products/stand-one-4th-gen-silver",
    description: "Qi2.2 wireless charging stand (Silver)",
  },
  {
    name: "iPhone Air MagSafe Battery",
    category: Category.Accessories,
    price: 99,
    image: "/gear/magsafe-battery.png",
    url: "https://www.apple.com/shop/product/mgpg4am/a/iphone-air-magsafe-battery",
    description: "Slim wireless battery pack",
  },
  {
    name: "iPhone Air MagSafe Battery",
    category: Category.Accessories,
    price: 99,
    image: "/gear/magsafe-battery.png",
    url: "https://www.apple.com/shop/product/mgpg4am/a/iphone-air-magsafe-battery",
    description: "Slim wireless battery pack",
  },
  {
    name: "Roost V3+",
    category: Category.Desk,
    price: 99,
    image: "/gear/roost-v3-plus.png",
    url: "https://www.therooststand.com/products/roost-v3-plus-laptop-stand",
    description: "Portable laptop stand (Dune)",
  },
  {
    name: "Roost V3+",
    category: Category.Desk,
    price: 99,
    image: "/gear/roost-v3-plus.png",
    url: "https://www.therooststand.com/products/roost-v3-plus-laptop-stand",
    description: "Portable laptop stand (Dune)",
  },
  {
    name: "Magic Keyboard",
    category: Category.Computing,
    price: 99,
    image: "/gear/magic-keyboard.png",
    url: "https://www.apple.com/shop/product/mxcl3ll/a/magic-keyboard-usb-c-us-english",
    description: "Wireless keyboard with USB-C (White)",
  },
  {
    name: "Magic Trackpad",
    category: Category.Computing,
    price: 129,
    image: "/gear/magic-trackpad.png",
    url: "https://www.apple.com/shop/product/mxk93am/a/magic-trackpad-usb-c-white-multi-touch-surface",
    description: "Wireless trackpad with Force Touch (White)",
  },
  // Accessories
  {
    name: "Ergotron HX Dual Monitor Arm",
    category: Category.Accessories,
    price: 649,
    image: "/gear/ergotron-hx.png",
    url: "https://www.ergotron.com/en-us/products/product-details/45-476-216",
    description: "Heavy-duty dual monitor mount",
  },
  {
    name: "Elgato Stream Deck +",
    category: Category.Accessories,
    price: 199,
    image: "/gear/stream-deck-white.png",
    url: "https://www.elgato.com/us/en/p/stream-deck-plus-white",
    description: "Customizable LCD control panel",
  },
  {
    name: "Brydge ProDock",
    category: Category.Accessories,
    price: 400,
    image: "/gear/brydge-prodock.png",
    url: "https://www.brydge.com/prodock",
    description: "Thunderbolt 4 vertical docking station",
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
