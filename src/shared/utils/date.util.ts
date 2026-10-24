import {
  differenceInDays,
  differenceInCalendarDays,
  differenceInHours,
  differenceInMinutes,
  lastDayOfMonth,
  endOfMonth,
  startOfMonth,
  startOfDay,
  endOfDay,
  nextSunday,
  nextMonday,
  nextFriday,
  addDays,
  addHours,
  addMinutes,
  addMonths,
  subDays,
  subHours,
  subMonths,
  isPast,
  isFuture,
  isValid,
  format,
  formatDistanceToNow,
} from 'date-fns';

// Re-export core date-fns functions for convenient access across the app
export {
  differenceInDays,
  differenceInCalendarDays,
  differenceInHours,
  differenceInMinutes,
  lastDayOfMonth,
  endOfMonth,
  startOfMonth,
  startOfDay,
  endOfDay,
  nextSunday,
  nextMonday,
  nextFriday,
  addDays,
  addHours,
  addMinutes,
  addMonths,
  subDays,
  subHours,
  subMonths,
  isPast,
  isFuture,
  isValid,
  format,
  formatDistanceToNow,
};

/**
 * Enterprise Date & Time Utility powered by date-fns
 * Standardizes UTC formatting, calendar calculations, and duration metrics.
 */
export class DateUtil {
  /**
   * Get current UTC Date instance
   */
  public static nowUTC(): Date {
    return new Date();
  }

  /**
   * Format any date into standard ISO 8601 UTC string (e.g. 2026-10-25T02:15:00.000Z)
   */
  public static toUTCISOString(date: Date | string | number = new Date()): string {
    const d = typeof date === 'object' && date instanceof Date ? date : new Date(date);
    if (!isValid(d)) {
      throw new Error(`Invalid date provided to toUTCISOString: ${String(date)}`);
    }
    return d.toISOString();
  }

  /**
   * Calculate how many days are left until a target date (e.g. subscription or trial expiry)
   * Returns negative number if the date has already passed.
   */
  public static daysLeft(targetDate: Date | string | number, fromDate: Date = new Date()): number {
    const target = typeof targetDate === 'object' && targetDate instanceof Date ? targetDate : new Date(targetDate);
    return differenceInCalendarDays(target, fromDate);
  }

  /**
   * Get the last day of the month for a given date (defaults to current month)
   */
  public static lastDateOfMonth(date: Date = new Date()): Date {
    return lastDayOfMonth(date);
  }

  /**
   * Get the exact end of the month (YYYY-MM-DD 23:59:59.999)
   */
  public static endOfCurrentMonth(date: Date = new Date()): Date {
    return endOfMonth(date);
  }

  /**
   * Get the Date of the upcoming Sunday
   */
  public static dateOnNextSunday(date: Date = new Date()): Date {
    return nextSunday(date);
  }

  /**
   * Format date with custom format string (e.g. 'yyyy-MM-dd HH:mm:ss')
   */
  public static format(date: Date | number, formatStr: string): string {
    return format(date, formatStr);
  }

  /**
   * Human-readable relative time (e.g. "about 2 hours ago", "in 3 days")
   */
  public static timeAgo(date: Date | number): string {
    return formatDistanceToNow(date, { addSuffix: true });
  }

  /**
   * Check if date is in the past
   */
  public static isPast(date: Date | string | number): boolean {
    const d = typeof date === 'object' && date instanceof Date ? date : new Date(date);
    return isPast(d);
  }

  /**
   * Check if date is in the future
   */
  public static isFuture(date: Date | string | number): boolean {
    const d = typeof date === 'object' && date instanceof Date ? date : new Date(date);
    return isFuture(d);
  }

  /**
   * Unix epoch seconds
   */
  public static toUnixSeconds(date: Date | string | number = new Date()): number {
    const d = typeof date === 'object' && date instanceof Date ? date : new Date(date);
    return Math.floor(d.getTime() / 1000);
  }
}
