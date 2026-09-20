export type FeeSettings = {
  listingFee: number;
  transactionRate: number;
  paymentRate: number;
  paymentFixed: number;
  offsiteAdsEnabled: boolean;
  offsiteAdsRate: number;
  defaultShippingCost: number;
};

export type FeeLine = { quantity: number; itemTotal: number; price?: number };
export type OrderFeeInput = {
  orderValue: number;
  shipping: number;
  salesTax?: number;
  cardProcessingFees?: number | null;
  offsiteAdsAttributed?: boolean;
  items: FeeLine[];
  useOffsiteFallback?: boolean;
};

export function calculateOrderFees(order: OrderFeeInput, settings: FeeSettings) {
  const itemRevenue = order.items.reduce((sum, item) => sum + (item.itemTotal || (item.price ?? 0) * item.quantity), 0);
  const revenue = itemRevenue || order.orderValue;
  const transactionBase = revenue + order.shipping;
  const listingFees = order.items.reduce((sum, item) => sum + settings.listingFee * item.quantity, 0);
  const transactionFees = transactionBase * (settings.transactionRate / 100);
  const processingFees = order.cardProcessingFees != null ? order.cardProcessingFees : transactionBase * (settings.paymentRate / 100) + settings.paymentFixed;
  const offsiteAds = settings.offsiteAdsEnabled && (order.offsiteAdsAttributed || order.useOffsiteFallback === true) ? transactionBase * (settings.offsiteAdsRate / 100) : 0;
  return { revenue, shippingRevenue: order.shipping, salesTax: order.salesTax ?? 0, listingFees, transactionFees, processingFees, offsiteAds, fees: listingFees + transactionFees + processingFees + offsiteAds, shippingCost: settings.defaultShippingCost, units: order.items.reduce((sum, item) => sum + item.quantity, 0) };
}

export function calculateWhatIfPrice(price: number, product: { materialCost: number; laborMinutes: number; packagingCost: number }, settings: FeeSettings & { hourlyRate: number }) {
  const fees = calculateOrderFees({ orderValue: price, shipping: 0, items: [{ quantity: 1, itemTotal: price }] }, settings);
  const labor = product.laborMinutes / 60 * settings.hourlyRate;
  const profit = price - fees.fees - fees.shippingCost - product.materialCost - labor - product.packagingCost;
  return { price, fees: fees.fees, profit, margin: price ? profit / price * 100 : 0, profitPerHour: product.laborMinutes > 0 ? profit / (product.laborMinutes / 60) : null };
}
