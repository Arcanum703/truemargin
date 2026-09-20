import { describe, expect, it } from "vitest";
import { calculateOrderFees } from "../lib/fee-engine";

const settings = { listingFee: 0.2, transactionRate: 6.5, paymentRate: 3, paymentFixed: 0.25, offsiteAdsEnabled: true, offsiteAdsRate: 15, defaultShippingCost: 4 };

describe("TrueMargin fee engine", () => {
  it("computes transaction and processing fees", () => {
    const result = calculateOrderFees({ orderValue: 100, shipping: 5, items: [{ quantity: 1, itemTotal: 100 }] }, settings);
    expect(result.transactionFees).toBeCloseTo(6.825);
    expect(result.processingFees).toBeCloseTo(3.4);
  });
  it("uses actual card processing fees when exported", () => {
    const result = calculateOrderFees({ orderValue: 100, shipping: 0, cardProcessingFees: 4.88, items: [{ quantity: 1, itemTotal: 100 }] }, settings);
    expect(result.processingFees).toBe(4.88);
  });
  it("charges listing fee per quantity", () => {
    const result = calculateOrderFees({ orderValue: 60, shipping: 0, items: [{ quantity: 3, itemTotal: 60 }] }, settings);
    expect(result.listingFees).toBeCloseTo(0.6);
    expect(result.units).toBe(3);
  });
  it("adds offsite ads for flagged orders", () => {
    const result = calculateOrderFees({ orderValue: 100, shipping: 0, offsiteAdsAttributed: true, items: [{ quantity: 1, itemTotal: 100 }] }, settings);
    expect(result.offsiteAds).toBe(15);
  });
  it("does not add offsite ads when unflagged", () => {
    const result = calculateOrderFees({ orderValue: 100, shipping: 0, items: [{ quantity: 1, itemTotal: 100 }] }, settings);
    expect(result.offsiteAds).toBe(0);
  });
  it("falls back to price when item total is missing", () => {
    const result = calculateOrderFees({ orderValue: 20, shipping: 0, items: [{ quantity: 2, price: 10, itemTotal: 0 }] }, settings);
    expect(result.revenue).toBe(20);
  });
});
