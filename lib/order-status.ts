export function isRefundedStatus(status: string) {
  return /refund|cancel/i.test(status);
}
