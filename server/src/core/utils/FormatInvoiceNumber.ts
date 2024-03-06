
export function formatInvoiceNumber(year: number, number: number): string {
  return String(year) + 'ST-' + String(number).padStart(5, '0')
}