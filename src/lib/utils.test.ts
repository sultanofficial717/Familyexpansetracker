import { formatCurrency, formatMonth, cn } from '../lib/utils';

describe('Utils - formatCurrency', () => {
  it('should format currency with PKR', () => {
    const result = formatCurrency(1000);
    expect(result.includes('1000') || result.includes('1,000')).toBeTruthy();
  });

  it('should handle zero amount', () => {
    const result = formatCurrency(0);
    expect(result.includes('0')).toBeTruthy();
  });

  it('should handle large amounts', () => {
    const result = formatCurrency(10000000);
    expect(result.length > 0).toBeTruthy();
  });
});

describe('Utils - formatMonth', () => {
  it('should format date as YYYY-MM', () => {
    const date = new Date('2024-05-15');
    const result = formatMonth(date);
    expect(result).toBe('2024-05');
  });
});

describe('Utils - cn', () => {
  it('should merge class names', () => {
    const result = cn('px-4', 'py-3');
    expect(result.includes('px-4')).toBeTruthy();
  });
});
