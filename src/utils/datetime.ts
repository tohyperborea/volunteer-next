/**
 * Utilities for working with dates and times
 * @since 2026-02-28
 * @author Michael Townsend <@continuities>
 */

/**
 * Converts a time string in HH:MM format to a TimeString type, validating the format.
 * @param timeStr - A string in HH:MM format
 * @returns The input string if it is valid
 * @throws Error if the input string is not in valid HH:MM format
 */
export const stringToTime = (timeStr: string): TimeString => {
  // Validate time string is in HH:MM format
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(timeStr)) {
    throw new Error('Invalid time format, expected HH:MM');
  }
  return timeStr as TimeString;
};

/**
 * Converts an EventDay number to a Date object based on the event's start date.
 * @param eventStartDate - The start date of the event
 * @param eventDay - The day of the event (0 for first day, 1 for second day, etc.)
 * @returns A Date object representing the specific day of the event
 */
export const eventDayToDate = (eventStartDate: Date, eventDay: EventDay): Date => {
  const result = new Date(eventStartDate);
  result.setDate(result.getDate() + eventDay);
  return result;
};

/**
 * Converts a Date object to an EventDay number based on the event's start date.
 * @param eventStartDate - The start date of the event
 * @param date - The date to convert to an EventDay
 * @returns The EventDay number corresponding to the given date
 */
export const dateToEventDay = (eventStartDate: Date, date: Date): EventDay => {
  const timeDiff = date.getTime() - eventStartDate.getTime();
  const dayDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  return dayDiff as EventDay;
};

/**
 * Adds a specified number of hours to a time string in HH:MM format.
 * @param timeStr - A string in HH:MM format
 * @param hoursToAdd - The number of hours to add
 * @returns A new time string in HH:MM format with the hours added
 */
export const addHoursToTimeString = (timeStr: TimeString, hoursToAdd: number): TimeString => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + hoursToAdd * 60;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;
  return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}` as TimeString;
};

/**
 *
 * @param eventStartDate - The start date of the event
 * @param eventDay - The day of the event (0 for first day, 1 for second day, etc.)
 * @param timeStr - A time string in HH:MM format
 * @returns A Date object representing the specific date and time of the event (without timezone)
 */
export const eventDayTimeToDate = (
  eventStartDate: Date,
  eventDay: EventDay,
  timeStr: TimeString
): Date => {
  const date = eventDayToDate(eventStartDate, eventDay);
  const [hours, minutes] = timeStr.split(':').map(Number);
  date.setUTCHours(hours, minutes, 0, 0);
  return date;
};
