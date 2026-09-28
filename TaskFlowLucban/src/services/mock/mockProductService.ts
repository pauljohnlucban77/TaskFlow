import { ProductService } from '../types';
import { Product, Category } from '../../types/product';
import { mockProducts } from '../../data/mock/products';
import { mockCategories } from '../../data/mock/categories';

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

export const mockProductService: ProductService = {
  async getProducts(): Promise<Product[]> {
    await delay();
    return mockProducts;
  },
  async getCategories(): Promise<Category[]> {
    await delay(150);
    return mockCategories;
  },
  async getFeaturedProducts(): Promise<Product[]> {
    await delay();
    return mockProducts.filter((p) => p.featured);
  },
  async getPopularProducts(): Promise<Product[]> {
    await delay();
    return mockProducts.filter((p) => p.popular);
  },
  async getProductById(id: string): Promise<Product | null> {
    await delay(200);
    return mockProducts.find((p) => p.id === id) || null;
  },
};
