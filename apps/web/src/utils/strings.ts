export function isEmail(value: string): boolean {
  // basic RFC 5322-light check suitable for UI validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}