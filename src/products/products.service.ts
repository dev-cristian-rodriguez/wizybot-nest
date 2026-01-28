import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';

export interface Product {
  displayTitle: string;
  embeddingText: string;
  url: string;
  imageUrl: string;
  productType: string;
  discount: number;
  price: string;
  variants: string;
  createDate: string;
}

@Injectable()
export class ProductsService implements OnModuleInit {
  private products: Product[] = [];
  private csvFilePath: string;

  constructor(private configService: ConfigService) {
    // Get CSV file path from configuration
    this.csvFilePath =
      this.configService.get<string>('app.csvFilePath') ||
      'src/products/products_list.csv';
  }

  async onModuleInit() {
    await this.loadProducts();
  }

  private async loadProducts(): Promise<void> {
    return new Promise((resolve, reject) => {
      const products: Product[] = [];
      const filePath = path.resolve(this.csvFilePath);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.warn(
          `CSV file not found at ${filePath}. Products search will be unavailable.`,
        );
        this.products = [];
        resolve();
        return;
      }

      // Read and parse CSV file
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row: Record<string, string>) => {
          // Parse each row and convert to Product interface
          products.push({
            displayTitle: row.displayTitle || '',
            embeddingText: row.embeddingText || '',
            url: row.url || '',
            imageUrl: row.imageUrl || '',
            productType: row.productType || '',
            discount: parseInt(row.discount || '0', 10),
            price: row.price || '',
            variants: row.variants || '',
            createDate: row.createDate || '',
          });
        })
        .on('end', () => {
          this.products = products;
          console.log(`Loaded ${products.length} products from CSV`);
          resolve();
        })
        .on('error', (error: Error) => {
          console.error('Error loading products CSV:', error);
          reject(error);
        });
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async searchProducts(query: string): Promise<Product[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    if (this.products.length === 0) {
      // console.log('No products loaded, cannot search');
      return [];
    }

    // Normalize query for better matching
    const normalizedQuery = query.toLowerCase().trim();

    // Score each product based on relevance
    const scoredProducts = this.products.map((product) => {
      let score = 0;

      // Check if query matches in display title (highest weight)
      const titleLower = product.displayTitle.toLowerCase();
      if (titleLower.includes(normalizedQuery)) {
        score += 10;
      }

      // Check for word matches in title
      const queryWords = normalizedQuery.split(/\s+/);
      queryWords.forEach((word) => {
        if (titleLower.includes(word)) {
          score += 5;
        }
      });

      // Check if query matches in embedding text (medium weight)
      const embeddingLower = product.embeddingText.toLowerCase();
      if (embeddingLower.includes(normalizedQuery)) {
        score += 3;
      }

      // Check for word matches in embedding text
      queryWords.forEach((word) => {
        if (embeddingLower.includes(word)) {
          score += 1;
        }
      });

      // Check if query matches in product type
      const productTypeLower = product.productType.toLowerCase();
      if (productTypeLower.includes(normalizedQuery)) {
        score += 2;
      }

      return { product, score };
    });

    // Sort by score (descending) and return top 2
    const sortedProducts = scoredProducts
      .filter((item) => item.score > 0) // Only include products with matches
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map((item) => item.product);

    // if (sortedProducts.length > 0) {
    //   console.log(`Product search completed: ${sortedProducts.length} results for "${query}"`);
    // } else {
    //   console.log(`No products found matching "${query}"`);
    // }

    return sortedProducts;
  }

  // Gets all loaded products (for debugging/testing purposes)
  getAllProducts(): Product[] {
    return this.products;
  }
}
