import { parse, isAfter, isBefore } from 'date-fns';

/**
 * Combines a Date object and a time string into a single Date object.
 * Assumes the time string is in "hh:mm a" format (e.g. "06:00 AM").
 */
export function combineDateAndTime(date: Date, timeString: string): Date {
  const parsedTime = parse(timeString, 'hh:mm a', date);
  return parsedTime;
}

/**
 * Checks if a given slot (date + startTime) is in the past.
 */
export function isPastSlot(date: Date, startTimeString: string): boolean {
  const slotStart = combineDateAndTime(date, startTimeString);
  return isBefore(slotStart, new Date());
}

/**
 * Checks if a given slot's end time has passed.
 */
export function hasSlotEnded(date: Date, endTimeString: string): boolean {
  const slotEnd = combineDateAndTime(date, endTimeString);
  return isBefore(slotEnd, new Date());
}
