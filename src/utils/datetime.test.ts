import {
  stringToTime,
  eventDayToDate,
  dateToEventDay,
  addHoursToTimeString,
  eventDayTimeToDate
} from './datetime';

describe('datetime utilities', () => {
  describe('stringToTime', () => {
    it('should convert valid HH:MM string to TimeString', () => {
      expect(stringToTime('12:34')).toBe('12:34');
    });

    it('should throw an error for invalid time format', () => {
      expect(() => stringToTime('25:00')).toThrow('Invalid time format, expected HH:MM(:SS)?');
      expect(() => stringToTime('12:60')).toThrow('Invalid time format, expected HH:MM(:SS)?');
      expect(() => stringToTime('abc')).toThrow('Invalid time format, expected HH:MM(:SS)?');
    });
  });

  describe('eventDayToDate', () => {
    it('should calculate the correct date for an event day', () => {
      const eventStartDate = new Date('2023-01-01');
      expect(eventDayToDate(eventStartDate, 0).toISOString()).toBe(
        new Date('2023-01-01').toISOString()
      );
      expect(eventDayToDate(eventStartDate, 1).toISOString()).toBe(
        new Date('2023-01-02').toISOString()
      );
      expect(eventDayToDate(eventStartDate, 5).toISOString()).toBe(
        new Date('2023-01-06').toISOString()
      );
    });
  });

  describe('dateToEventDay', () => {
    it('should calculate the correct event day for a given date', () => {
      const eventStartDate = new Date('2023-01-01');
      expect(dateToEventDay(eventStartDate, new Date('2023-01-01'))).toBe(0);
      expect(dateToEventDay(eventStartDate, new Date('2023-01-02'))).toBe(1);
      expect(dateToEventDay(eventStartDate, new Date('2023-01-06'))).toBe(5);
    });
  });

  describe('addHoursToTimeString', () => {
    it('should add hours to a time string correctly', () => {
      expect(addHoursToTimeString('12:00', 2)).toBe('14:00');
      expect(addHoursToTimeString('23:30', 2)).toBe('01:30');
      expect(addHoursToTimeString('00:15', 25)).toBe('01:15');
    });
  });

  describe('eventDayTimeToDate', () => {
    it('should calculate the correct Date object for an event day and time', () => {
      const eventStartDate = new Date('2023-01-01');
      const result = eventDayTimeToDate(eventStartDate, 1, '12:30');
      expect(result.toISOString()).toBe(new Date('2023-01-02T12:30:00.000Z').toISOString());
    });
  });
});
