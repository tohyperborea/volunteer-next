import { validateExistingEvent, validateNewEvent } from './event-validator';

describe('Event Validator', () => {
  describe('validateNewEvent', () => {
    it('validates a new event successfully', () => {
      const formData = new FormData();
      formData.set('name', 'Test Event');
      formData.set('slug', 'test-event');
      formData.set('startDate', '2025-12-01');
      formData.set('endDate', '2025-12-05');

      const result = validateNewEvent(formData);

      expect(result).toEqual({
        name: 'Test Event',
        slug: 'test-event',
        startDate: new Date('2025-12-01'),
        endDate: new Date('2025-12-05')
      });
    });

    it('throws an error if name is missing', () => {
      const formData = new FormData();
      formData.set('slug', 'test-event');
      formData.set('startDate', '2025-12-01');
      formData.set('endDate', '2025-12-05');

      expect(() => validateNewEvent(formData)).toThrow('Event name is required');
    });

    it('throws an error if slug is missing', () => {
      const formData = new FormData();
      formData.set('name', 'Test Event');
      formData.set('startDate', '2025-12-01');
      formData.set('endDate', '2025-12-05');

      expect(() => validateNewEvent(formData)).toThrow('Event slug is required');
    });

    it('should ensure that slug is URL-friendly', () => {
      const formData = new FormData();
      formData.set('name', 'Test Event');
      formData.set('startDate', '2025-12-01');
      formData.set('endDate', '2025-12-05');
      formData.append('slug', '"slug< w~ith >ba&d | char\\ac`ters% a?nd [{spaces}]^');

      const result = validateNewEvent(formData);

      expect(result.slug).toBe(
        '%22slug%3C%20w~ith%20%3Eba%26d%20%7C%20char%5Cac%60ters%25%20a%3Fnd%20%5B%7Bspaces%7D%5D%5E'
      );
    });

    it('throws an error if startDate is missing', () => {
      const formData = new FormData();
      formData.set('name', 'Test Event');
      formData.set('slug', 'test-event');
      formData.set('endDate', '2025-12-05');

      expect(() => validateNewEvent(formData)).toThrow('Start date is required');
    });

    it('throws an error if endDate is missing', () => {
      const formData = new FormData();
      formData.set('name', 'Test Event');
      formData.set('slug', 'test-event');
      formData.set('startDate', '2025-12-01');

      expect(() => validateNewEvent(formData)).toThrow('End date is required');
    });

    it('throws an error if endDate is before startDate', () => {
      const formData = new FormData();
      formData.set('name', 'Test Event');
      formData.set('slug', 'test-event');
      formData.set('startDate', '2025-12-05');
      formData.set('endDate', '2025-12-01');

      expect(() => validateNewEvent(formData)).toThrow('End date cannot be before start date');
    });
  });

  describe('validateExistingEvent', () => {
    it('validates an existing event successfully', () => {
      const formData = new FormData();
      formData.set('id', 'event-123');
      formData.set('name', 'Test Event');
      formData.set('slug', 'test-event');
      formData.set('startDate', '2025-12-01');
      formData.set('endDate', '2025-12-05');

      const result = validateExistingEvent(formData);

      expect(result).toEqual({
        id: 'event-123',
        name: 'Test Event',
        slug: 'test-event',
        startDate: new Date('2025-12-01'),
        endDate: new Date('2025-12-05')
      });
    });

    it('throws an error if id is missing', () => {
      const formData = new FormData();
      formData.set('name', 'Test Event');
      formData.set('slug', 'test-event');
      formData.set('startDate', '2025-12-01');
      formData.set('endDate', '2025-12-05');

      expect(() => validateExistingEvent(formData)).toThrow('Event ID is required');
    });

    it('throws an error if validateNewEvent fails', () => {
      const formData = new FormData();
      formData.set('id', 'event-123');
      formData.set('slug', 'test-event');
      formData.set('startDate', '2025-12-01');
      formData.set('endDate', '2025-12-05');

      expect(() => validateExistingEvent(formData)).toThrow('Event name is required');
    });
  });
});
