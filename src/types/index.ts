export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: 'fresh' | 'bottled' | 'bundle' | 'seasonal';
  flavor: string[];
  sizes: ProductSize[];
  featured: boolean;
  badge?: string;
  ingredients: string[];
  nutritionFacts?: NutritionFacts;
  inStock: boolean;
  rating: number;
  reviewCount: number;
}

export interface ProductSize {
  label: string;
  ml: number;
  price: number;
}

export interface NutritionFacts {
  calories: number;
  sugar: string;
  vitaminC: string;
  fiber: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: ProductSize;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'picked_up';
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress?: string;
  deliveryType: 'pickup' | 'delivery';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TikTokVideo {
  id: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  createdAt: string;
  hashtags: string[];
  featured: boolean;
}

export interface SiteContent {
  hero: {
    headline: string;
    subheadline: string;
    ctaText: string;
    ctaLink?: string;
    backgroundVideo?: string;
  };
  about: {
    headline: string;
    story: string;
    mission: string;
    founderName: string;
    founderBio: string;
    founderImage: string;
  };
  contact: {
    phone: string;
    email: string;
    instagram: string;
    tiktok: string;
    address: string;
    hours: string;
  };
}
