import { describe, expect, it } from "vitest";
import { productMetrics } from "../lib/metrics";

const settings = { listingFee: 0.2, transactionRate: 6.5, paymentRate: 3, paymentFixed: 0.25, offsiteAdsEnabled: true, offsiteAdsRate: 15, defaultShippingCost: 4, hourlyRate: 0, estimatedOffsitePercent: 0 };
const product = { id: "p1", name: "Mug", sku: "", materialCost: 3.5, laborMinutes: 0, packagingCost: 0, stockOnHand: 10, reorderPoint: 2 };

describe("productMetrics", () => {
  it("subtracts allocated shipping so the waterfall adds up", () => {
    const orders = [{ status: "Completed", orderValue: 12, shipping: 0, salesTax: 0, cardProcessingFees: null, offsiteAdsAttributed: false, items: [{ itemName: "Mug", quantity: 1, itemTotal: 12, price: 12 }] }];
    const [metric] = productMetrics([product], orders, settings);
    expect(metric.shipping).toBe(4);
    expect(metric.profit).toBeCloseTo(12 - metric.fees - 4 - 3.5);
    expect(metric.cogs).toBeCloseTo(7.5);
  });
  it("splits shipping across products in a shared order by revenue share", () => {
    const other = { ...product, id: "p2", name: "Bowl", materialCost: 0 };
    const orders = [{ status: "Completed", orderValue: 40, shipping: 0, salesTax: 0, cardProcessingFees: null, offsiteAdsAttributed: false, items: [{ itemName: "Mug", quantity: 1, itemTotal: 10, price: 10 }, { itemName: "Bowl", quantity: 1, itemTotal: 30, price: 30 }] }];
    const [mug, bowl] = productMetrics([product, other], orders, settings);
    expect(mug.shipping).toBeCloseTo(1);
    expect(bowl.shipping).toBeCloseTo(3);
  });
});
