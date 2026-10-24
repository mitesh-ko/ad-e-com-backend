import { describe, it, expect } from 'vitest';
import {
  DateUtil,
  differenceInDays,
  lastDayOfMonth,
  nextSunday,
  addDays,
} from '#shared/utils/date.util.js';

describe('DateUtil powered by date-fns (Unit Tests)', () => {
  it('should calculate days left accurately (differenceInDays / daysLeft)', () => {
    const today = new Date('2026-10-01T00:00:00.000Z');
    const futureDeadline = new Date('2026-10-15T00:00:00.000Z');

    const days = DateUtil.daysLeft(futureDeadline, today);
    expect(days).toBe(14);

    const directDays = differenceInDays(futureDeadline, today);
    expect(directDays).toBe(14);
  });

  it('should get the last date of the current month (lastDayOfMonth)', () => {
    // October has 31 days
    const octDate = new Date('2026-10-10T12:00:00.000Z');
    const lastDay = DateUtil.lastDateOfMonth(octDate);

    expect(lastDay.getDate()).toBe(31);
    expect(lastDayOfMonth(octDate).getDate()).toBe(31);

    // February 2026 has 28 days (not a leap year)
    const febDate = new Date('2026-02-05T00:00:00.000Z');
    expect(DateUtil.lastDateOfMonth(febDate).getDate()).toBe(28);
  });

  it('should find the date on next Sunday (nextSunday)', () => {
    // 2026-10-21 is a Wednesday
    const wednesday = new Date('2026-10-21T10:00:00.000Z');
    const upcomingSunday = DateUtil.dateOnNextSunday(wednesday);

    // Next Sunday is October 25, 2026 (day of week 0)
    expect(upcomingSunday.getDay()).toBe(0);
    expect(upcomingSunday.getDate()).toBe(25);

    expect(nextSunday(wednesday).getDay()).toBe(0);
  });

  it('should support safe date addition with addDays', () => {
    const start = new Date('2026-01-01T00:00:00.000Z');
    const plus7 = addDays(start, 7);

    expect(plus7.getDate()).toBe(8);
  });

  it('should format ISO 8601 UTC strings with Z suffix', () => {
    const iso = DateUtil.toUTCISOString();
    expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it('should detect past and future dates', () => {
    const past = new Date('2020-01-01T00:00:00.000Z');
    const future = new Date('2030-01-01T00:00:00.000Z');

    expect(DateUtil.isPast(past)).toBe(true);
    expect(DateUtil.isFuture(past)).toBe(false);

    expect(DateUtil.isFuture(future)).toBe(true);
    expect(DateUtil.isPast(future)).toBe(false);
  });
});
