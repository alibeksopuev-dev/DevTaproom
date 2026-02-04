export type CategoryId = 'beers' | 'snacks' | 'drinks' | 'wines' | 'bottles';

export interface BeerMetadata {
  ibu: number;
  abv: number;
  // Sizes are now handled via prices array in Product
}

export interface WineMetadata {
  region: string;
  country: string;
  grapeVariety?: string;
  style?: string;
}

export interface ProductMetadata {
  beer?: BeerMetadata;
  wine?: WineMetadata;
  tags?: string[];
}

export interface ProductPrice {
  id: string;
  size: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  nameVi?: string;
  nameJa?: string;
  nameKo?: string;
  description: string;
  descriptionVi?: string;
  descriptionJa?: string;
  descriptionKo?: string;
  price: number; // in VND
  category: CategoryId;
  metadata?: ProductMetadata;
  subcategory?: string;
  prices?: ProductPrice[];
}

export type BeerSize = string; // Was '0.33' | '0.50', now dynamic string

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: BeerSize; // For beers with size options
}

export interface Category {
  id: CategoryId;
  name: string;
  nameVi: string;
  nameJa: string;
  nameKo: string;
  icon: string;
  order: number;
}
