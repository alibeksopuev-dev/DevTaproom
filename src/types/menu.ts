export type CategoryId = 'beers' | 'snacks' | 'drinks' | 'wines' | 'bottles';

export interface BeerMetadata {
  ibu: number;
  abv: number;
  size033ml?: number; // price for 0.33L
  size050ml?: number; // price for 0.50L
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
  price: number; // in VND (thousands)
  category: CategoryId;
  metadata?: ProductMetadata;
  subcategory?: string;
}

export type BeerSize = '0.33' | '0.50';

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
