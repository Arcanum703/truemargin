import { describe, expect, it } from "vitest";
import { pickKind, type Candidate } from "@/lib/lifecycle";

const DAY = 24 * 60 * 60 * 1000;
const now = Date.parse("2026-09-25T09:00:00Z");
const user = (ageDays: number, ws: Partial<Candidate["workspace"] & object>, sent: string[] = []): Candidate => ({
  id: "u", email: "u@example.com", createdAt: new Date(now - ageDays * DAY), sent: new Set(sent),
  workspace: { trialEndsAt: new Date(now + (14 - ageDays) * DAY), subscriptionStatus: "TRIALING", orders: 0, products: 0, costedProducts: 0, ...ws },
});

describe("lifecycle sequencing", () => {
  it("welcomes new verified users once", () => {
    expect(pickKind(user(0, {}), now)).toBe("welcome");
    expect(pickKind(user(0.5, {}, ["welcome"]), now)).toBeNull();
  });
  it("nudges users who never imported after a day", () => {
    expect(pickKind(user(1.2, {}, ["welcome"]), now)).toBe("no_import");
    expect(pickKind(user(1.2, { orders: 50 }, ["welcome"]), now)).toBeNull();
  });
  it("asks for costs only when imported products have none", () => {
    expect(pickKind(user(2.5, { orders: 50, products: 8 }, ["welcome"]), now)).toBe("add_costs");
    expect(pickKind(user(2.5, { orders: 50, products: 8, costedProducts: 1 }, ["welcome"]), now)).toBeNull();
  });
  it("prioritises trial deadlines over onboarding nudges", () => {
    expect(pickKind(user(12, { orders: 50, products: 8 }, ["welcome"]), now)).toBe("trial_ending");
    expect(pickKind(user(15, {}, ["welcome", "trial_ending"]), now)).toBe("trial_ended");
    expect(pickKind(user(15, { subscriptionStatus: "ACTIVE" }, ["welcome", "trial_ending"]), now)).toBeNull();
  });
  it("skips users without a workspace", () => {
    expect(pickKind({ ...user(0, {}), workspace: null }, now)).toBeNull();
  });
});
