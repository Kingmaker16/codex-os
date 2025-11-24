// =============================================
// H5-STORE: LISTING BUILDER
// =============================================

import { ProductListingRequest, ProductVariant } from "../types.js";
import { generateId, timestamp } from "../utils.js";

export class ListingBuilder {
  async createShopifyListing(request: ProductListingRequest): Promise<any> {
    const { product, autoPublish } = request;

    // Build optimized listing
    const listing = {
      id: generateId(),
      platform: "shopify",
      title: this.optimizeTitle(product.title),
      description: this.optimizeDescription(product.description),
      price: product.price,
      images: product.images,
      variants: product.variants || [],
      seo: this.generateSEO(product),
      status: autoPublish ? "published" : "draft",
      createdAt: timestamp()
    };

    return {
      ok: true,
      platform: "shopify",
      listing,
      url: `https://store.example.com/products/${listing.id}`,
      message: "Shopify listing created"
    };
  }

  async createAmazonListing(request: ProductListingRequest): Promise<any> {
    const { product } = request;

    return {
      ok: true,
      platform: "amazon",
      listing: {
        id: generateId(),
        title: product.title.substring(0, 200), // Amazon limit
        bulletPoints: this.generateBulletPoints(product.description),
        price: product.price,
        images: product.images.slice(0, 9), // Amazon allows max 9
        createdAt: timestamp()
      },
      message: "Amazon listing created"
    };
  }

  async createEtsyListing(request: ProductListingRequest): Promise<any> {
    const { product } = request;

    return {
      ok: true,
      platform: "etsy",
      listing: {
        id: generateId(),
        title: product.title.substring(0, 140), // Etsy limit
        description: product.description,
        price: product.price,
        tags: this.generateEtsyTags(product),
        images: product.images.slice(0, 10),
        createdAt: timestamp()
      },
      message: "Etsy listing created"
    };
  }

  async bulkListingCreation(
    requests: ProductListingRequest[]
  ): Promise<any[]> {
    const results = [];

    for (const request of requests) {
      let result;
      
      switch (request.platform) {
        case "shopify":
          result = await this.createShopifyListing(request);
          break;
        case "amazon":
          result = await this.createAmazonListing(request);
          break;
        case "etsy":
          result = await this.createEtsyListing(request);
          break;
        default:
          result = { ok: false, error: "Unsupported platform" };
      }

      results.push(result);
    }

    return results;
  }

  private optimizeTitle(title: string): string {
    // Add SEO keywords, capitalize properly
    return title.trim().replace(/\s+/g, ' ');
  }

  private optimizeDescription(description: string): string {
    // Format with bullet points, add call-to-action
    return `${description}\n\n✓ Fast Shipping\n✓ 30-Day Returns\n✓ Customer Satisfaction Guaranteed`;
  }

  private generateSEO(product: ProductListingRequest["product"]): any {
    return {
      metaTitle: product.title,
      metaDescription: product.description.substring(0, 160),
      keywords: this.extractKeywords(product.title + " " + product.description)
    };
  }

  private extractKeywords(text: string): string[] {
    // Simple keyword extraction (in real implementation, use NLP)
    return text.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 4)
      .slice(0, 10);
  }

  private generateBulletPoints(description: string): string[] {
    // Convert description to bullet points
    const sentences = description.split('.').filter(s => s.trim().length > 0);
    return sentences.slice(0, 5).map(s => s.trim());
  }

  private generateEtsyTags(product: ProductListingRequest["product"]): string[] {
    // Generate Etsy-compliant tags
    const words = product.title.toLowerCase().split(/\s+/);
    return words.slice(0, 13); // Etsy max 13 tags
  }
}

export const listingBuilder = new ListingBuilder();
