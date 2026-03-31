import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatDistanceToNow, formatTime, formatCurrency } from './formatTime';

describe('formatDistanceToNow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-30T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return "just now" for recent times', () => {
    const date = new Date('2026-03-30T11:59:30Z'); // 30 seconds ago
    expect(formatDistanceToNow(date)).toBe('just now');
  });

  it('should return minutes for times less than an hour ago', () => {
    const date = new Date('2026-03-30T11:45:00Z'); // 15 minutes ago
    expect(formatDistanceToNow(date)).toBe('15m ago');
  });

  it('should return hours for times less than a day ago', () => {
    const date = new Date('2026-03-30T09:00:00Z'); // 3 hours ago
    expect(formatDistanceToNow(date)).toBe('3h ago');
  });

  it('should return days for times more than a day ago', () => {
    const date = new Date('2026-03-28T12:00:00Z'); // 2 days ago
    expect(formatDistanceToNow(date)).toBe('2d ago');
  });
});

describe('formatTime', () => {
  it('should format time in 12-hour format', () => {
    const date = new Date('2026-03-30T14:30:00Z');
    const result = formatTime(date);
    // The exact output depends on locale, but it should contain time components
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });
});

describe('formatCurrency', () => {
  it('should format BRL currency', () => {
    const result = formatCurrency(1234.56, 'BRL');
    expect(result).toContain('1.234,56'); // Brazilian format
  });

  it('should format USD currency', () => {
    const result = formatCurrency(1234.56, 'USD');
    // Result format depends on locale, just check it contains the number
    expect(result).toContain('1.234,56'); // pt-BR locale formats USD this way
  });

  it('should handle zero values', () => {
    const result = formatCurrency(0, 'BRL');
    expect(result).toContain('0');
  });

  it('should handle large numbers', () => {
    const result = formatCurrency(1000000, 'BRL');
    expect(result).toContain('1.000.000');
  });
});
