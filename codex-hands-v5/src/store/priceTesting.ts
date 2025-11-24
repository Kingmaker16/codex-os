// =============================================
// H5-STORE: PRICE TESTING ENGINE
// =============================================

import { generateId, timestamp, sleep } from "../utils.js";

export class PriceTesting {
  private tests: Map<string, PriceTest> = new Map();

  async createPriceTest(
    productId: string,
    basePrice: number,
    variants: number[]
  ): Promise<any> {
    const testId = generateId();

    const test: PriceTest = {
      id: testId,
      productId,
      basePrice,
      variants: variants.map(price => ({
        price,
        conversions: 0,
        revenue: 0,
        views: 0
      })),
      status: "running",
      startedAt: timestamp()
    };

    this.tests.set(testId, test);

    // Simulate test data collection
    this.simulateTestData(testId);

    return {
      ok: true,
      testId,
      productId,
      variants: variants.length,
      message: "Price test started"
    };
  }

  async getTestResults(testId: string): Promise<any> {
    const test = this.tests.get(testId);
    if (!test) {
      return { ok: false, error: "Test not found" };
    }

    // Calculate winner
    const winner = this.calculateWinner(test);

    return {
      ok: true,
      testId,
      status: test.status,
      basePrice: test.basePrice,
      variants: test.variants,
      winner,
      recommendation: winner 
        ? `Use price $${winner.price} (${winner.conversionRate.toFixed(2)}% conversion)`
        : "Not enough data yet"
    };
  }

  async stopTest(testId: string): Promise<any> {
    const test = this.tests.get(testId);
    if (!test) {
      return { ok: false, error: "Test not found" };
    }

    test.status = "completed";
    test.completedAt = timestamp();

    return {
      ok: true,
      testId,
      status: "completed",
      message: "Price test stopped"
    };
  }

  async dynamicPricingFlow(
    productId: string,
    minPrice: number,
    maxPrice: number,
    steps: number = 5
  ): Promise<any> {
    // Generate price variants
    const priceStep = (maxPrice - minPrice) / (steps - 1);
    const variants = Array.from({ length: steps }, (_, i) => 
      Math.round((minPrice + i * priceStep) * 100) / 100
    );

    // Create test
    const testResult = await this.createPriceTest(productId, variants[0], variants);

    // Wait for some data
    await sleep(5000);

    // Get results
    const results = await this.getTestResults(testResult.testId);

    return {
      ok: true,
      flow: "dynamic-pricing",
      productId,
      priceRange: { min: minPrice, max: maxPrice },
      test: results
    };
  }

  private async simulateTestData(testId: string): Promise<void> {
    const test = this.tests.get(testId);
    if (!test) return;

    // Simulate data over time
    setTimeout(() => {
      test.variants.forEach((variant, index) => {
        // Lower prices typically get more conversions
        const conversionRate = 0.05 - (index * 0.005);
        variant.views = Math.floor(Math.random() * 1000) + 500;
        variant.conversions = Math.floor(variant.views * conversionRate);
        variant.revenue = variant.conversions * variant.price;
      });
    }, 2000);
  }

  private calculateWinner(test: PriceTest): any {
    const variantsWithData = test.variants
      .filter(v => v.views > 0)
      .map(v => ({
        ...v,
        conversionRate: v.views > 0 ? (v.conversions / v.views) * 100 : 0,
        revenuePerView: v.views > 0 ? v.revenue / v.views : 0
      }));

    if (variantsWithData.length === 0) return null;

    // Winner is highest revenue per view
    return variantsWithData.reduce((best, current) => 
      current.revenuePerView > best.revenuePerView ? current : best
    );
  }
}

interface PriceTest {
  id: string;
  productId: string;
  basePrice: number;
  variants: PriceVariant[];
  status: "running" | "completed";
  startedAt: string;
  completedAt?: string;
}

interface PriceVariant {
  price: number;
  conversions: number;
  revenue: number;
  views: number;
}

export const priceTesting = new PriceTesting();
