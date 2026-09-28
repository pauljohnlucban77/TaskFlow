export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  stockStatus: 'available' | 'low_stock' | 'sold_out';
  rating?: number;
  featured: boolean;
  popular: boolean;
  published?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  sortOrder: number;
}
