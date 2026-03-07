export type Category = {
  id: string;
  name: string;
  icon: string;
};

export type Seller = {
  name: string;
  rating: number;
  totalRatings: number;
  phone: string;
};

export type Product = {
  id: string;
  title: string;
  categoryId: string;
  priceEgp: number;
  location: string;
  postedAgo: string;
  summary: string;
  description: string;
  features: string[];
  details: Array<{ key: string; value: string }>;
  images: string[];
  seller: Seller;
  featured?: boolean;
};

export const categories: Category[] = [
  { id: "vehicles", name: "Vehicles & Cars", icon: "🚗" },
  { id: "real-estate", name: "Real Estate & Properties", icon: "🏠" },
  { id: "mobiles", name: "Mobiles & Tablets", icon: "📱" },
  { id: "electronics", name: "Electronics & Appliances", icon: "💻" },
  { id: "furniture", name: "Furniture & Decor", icon: "🛋️" },
  { id: "fashion", name: "Fashion & Beauty", icon: "🧥" },
  { id: "pets", name: "Pets", icon: "🐶" },
  { id: "kids", name: "Kids & Baby", icon: "🧸" },
];

export const products: Product[] = [
  {
    id: "hp-laptop-15",
    title: "HP Laptop 15 - i7, 16GB RAM, 512GB SSD",
    categoryId: "electronics",
    priceEgp: 15250,
    location: "Mohandessin",
    postedAgo: "Over two weeks ago",
    summary: "Clean used laptop, strong battery, perfect for work and college.",
    description:
      "HP laptop in great condition with original charger. No hardware issues. Battery lasts around 5-6 hours with normal use.",
    features: ["Webcam privacy shutter", "Backlit keyboard", "Fast SSD"],
    details: [
      { key: "Condition", value: "Used" },
      { key: "Brand", value: "HP" },
      { key: "RAM", value: "16 GB" },
      { key: "Storage Type", value: "SSD" },
      { key: "Storage", value: "512 GB" },
    ],
    images: [
      "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80",
    ],
    seller: {
      name: "Mariam Almahdy",
      rating: 4.7,
      totalRatings: 18,
      phone: "+20 100 555 0123",
    },
    featured: true,
  },
  {
    id: "villa-new-cairo",
    title: "Standalone Villa in New Cairo - Chillout Park",
    categoryId: "real-estate",
    priceEgp: 18000000,
    location: "New Cairo",
    postedAgo: "3 days ago",
    summary: "Modern standalone villa with private garden and rooftop.",
    description:
      "Prime location villa, fully finished with high-end materials. Close to schools, malls, and main roads.",
    features: ["Private garden", "Garage", "Modern finishing"],
    details: [
      { key: "Type", value: "Villa" },
      { key: "Bedrooms", value: "5" },
      { key: "Bathrooms", value: "4" },
      { key: "Area", value: "420 sqm" },
      { key: "Finishing", value: "Fully finished" },
    ],
    images: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
    ],
    seller: {
      name: "Ahmed Adel",
      rating: 4.9,
      totalRatings: 33,
      phone: "+20 111 222 3344",
    },
    featured: true,
  },
  {
    id: "toyota-corolla-2020",
    title: "Toyota Corolla 2020 - First Owner",
    categoryId: "vehicles",
    priceEgp: 980000,
    location: "6th of October",
    postedAgo: "1 day ago",
    summary: "Well-maintained Corolla, full service history.",
    description:
      "Excellent condition, no accidents, original paint. Tires and battery recently replaced.",
    features: ["Rear camera", "Cruise control", "Automatic"],
    details: [
      { key: "Mileage", value: "62,000 km" },
      { key: "Transmission", value: "Automatic" },
      { key: "Fuel", value: "Petrol" },
      { key: "Color", value: "Silver" },
      { key: "Condition", value: "Used" },
    ],
    images: [
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1200&q=80",
    ],
    seller: {
      name: "Karim Nabil",
      rating: 4.6,
      totalRatings: 11,
      phone: "+20 109 556 7788",
    },
    featured: true,
  },
  {
    id: "iphone-14-pro-max",
    title: "iPhone 14 Pro Max 256GB",
    categoryId: "mobiles",
    priceEgp: 46500,
    location: "Nasr City",
    postedAgo: "5 hours ago",
    summary: "Almost new phone with 98% battery health.",
    description:
      "Comes with box, cable, and original accessories. No scratches.",
    features: ["98% battery health", "Face ID", "Original accessories"],
    details: [
      { key: "Storage", value: "256 GB" },
      { key: "Color", value: "Deep Purple" },
      { key: "Condition", value: "Like new" },
      { key: "Battery", value: "98%" },
      { key: "SIM", value: "Dual" },
    ],
    images: [
      "https://images.unsplash.com/photo-1678652197831-2d180705cd2c?auto=format&fit=crop&w=1200&q=80",
    ],
    seller: {
      name: "Noor Hassan",
      rating: 4.8,
      totalRatings: 22,
      phone: "+20 102 303 4040",
    },
    featured: true,
  },
  {
    id: "corner-sofa",
    title: "Modern Corner Sofa - Beige",
    categoryId: "furniture",
    priceEgp: 22000,
    location: "Maadi",
    postedAgo: "2 days ago",
    summary: "Large comfy sofa, very clean and gently used.",
    description:
      "Selling due to moving. Can help with delivery inside Cairo.",
    features: ["L-shape", "Washable fabric", "Minimal wear"],
    details: [
      { key: "Condition", value: "Used" },
      { key: "Material", value: "Fabric" },
      { key: "Seats", value: "5" },
      { key: "Color", value: "Beige" },
    ],
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
    ],
    seller: {
      name: "Salma Fathy",
      rating: 4.5,
      totalRatings: 7,
      phone: "+20 101 808 9090",
    },
  },
  {
    id: "makeup-bundle",
    title: "Beauty Bundle - New & Sealed",
    categoryId: "fashion",
    priceEgp: 3400,
    location: "Heliopolis",
    postedAgo: "Yesterday",
    summary: "Original branded makeup set, sealed products.",
    description:
      "Gift set with lipstick, highlighter, and palette. All original and untouched.",
    features: ["Original", "Sealed", "Gift ready"],
    details: [
      { key: "Condition", value: "New" },
      { key: "Brand", value: "Mixed" },
      { key: "Pieces", value: "8" },
    ],
    images: [
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=80",
    ],
    seller: {
      name: "Hoda Emad",
      rating: 4.9,
      totalRatings: 41,
      phone: "+20 128 100 1000",
    },
  },
];

export function getCategoryName(categoryId: string): string {
  return categories.find((category) => category.id === categoryId)?.name ?? "Other";
}

export function formatEgp(value: number): string {
  return `${new Intl.NumberFormat("en-US").format(value)} EGP`;
}
