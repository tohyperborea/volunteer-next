import { validateNewShift } from './shift-validator';

describe('validateNewShift', () => {
  const createFormData = (data: Record<string, string | undefined>): FormData => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value);
      }
    });
    return formData;
  };

  it('validates a valid shift', () => {
    const formData = createFormData({
      teamId: 'team-123',
      title: 'Morning Shift',
      'startTime-day': '1',
      'startTime-time': '08:00',
      durationHours: '4',
      minVolunteers: '2',
      maxVolunteers: '5',
      isActive: 'on'
    });

    const result = validateNewShift(formData);

    expect(result).toEqual({
      teamId: 'team-123',
      title: 'Morning Shift',
      eventDay: 1,
      startTime: '08:00',
      durationHours: 4,
      minVolunteers: 2,
      maxVolunteers: 5,
      requirements: [],
      isActive: true
    });
  });

  it('throws an error if teamId is missing', () => {
    const formData = createFormData({
      title: 'Morning Shift',
      'startTime-day': '1',
      'startTime-time': '08:00',
      durationHours: '4',
      minVolunteers: '2',
      maxVolunteers: '5',
      isActive: 'on'
    });

    expect(() => validateNewShift(formData)).toThrow('Shift teamId is required');
  });

  it('throws an error if title is missing', () => {
    const formData = createFormData({
      teamId: 'team-123',
      'startTime-day': '1',
      'startTime-time': '08:00',
      durationHours: '4',
      minVolunteers: '2',
      maxVolunteers: '5',
      isActive: 'on'
    });

    expect(() => validateNewShift(formData)).toThrow('Shift title is required');
  });

  it('throws an error if startTime-day is missing', () => {
    const formData = createFormData({
      teamId: 'team-123',
      title: 'Morning Shift',
      'startTime-time': '08:00',
      durationHours: '4',
      minVolunteers: '2',
      maxVolunteers: '5',
      isActive: 'on'
    });

    expect(() => validateNewShift(formData)).toThrow('Shift startTime-day is required');
  });

  it('throws an error if startTime-day is not a valid number', () => {
    const formData = createFormData({
      teamId: 'team-123',
      title: 'Morning Shift',
      'startTime-day': 'invalid',
      'startTime-time': '08:00',
      durationHours: '4',
      minVolunteers: '2',
      maxVolunteers: '5',
      isActive: 'on'
    });

    expect(() => validateNewShift(formData)).toThrow('Shift startTime-day must be a valid number');
  });

  it('throws an error if durationHours is missing', () => {
    const formData = createFormData({
      teamId: 'team-123',
      title: 'Morning Shift',
      'startTime-day': '1',
      'startTime-time': '08:00',
      minVolunteers: '2',
      maxVolunteers: '5',
      isActive: 'on'
    });

    expect(() => validateNewShift(formData)).toThrow('Shift durationHours is required');
  });

  it('throws an error if durationHours is not a positive number', () => {
    const formData = createFormData({
      teamId: 'team-123',
      title: 'Morning Shift',
      'startTime-day': '1',
      'startTime-time': '08:00',
      durationHours: '-1',
      minVolunteers: '2',
      maxVolunteers: '5',
      isActive: 'on'
    });

    expect(() => validateNewShift(formData)).toThrow(
      'Shift durationHours must be a positive number'
    );
  });

  it('throws an error if minVolunteers is missing', () => {
    const formData = createFormData({
      teamId: 'team-123',
      title: 'Morning Shift',
      'startTime-day': '1',
      'startTime-time': '08:00',
      durationHours: '4',
      maxVolunteers: '5',
      isActive: 'on'
    });

    expect(() => validateNewShift(formData)).toThrow('Shift minVolunteers is required');
  });

  it('throws an error if minVolunteers is not a non-negative integer', () => {
    const formData = createFormData({
      teamId: 'team-123',
      title: 'Morning Shift',
      'startTime-day': '1',
      'startTime-time': '08:00',
      durationHours: '4',
      minVolunteers: '-1',
      maxVolunteers: '5',
      isActive: 'on'
    });

    expect(() => validateNewShift(formData)).toThrow(
      'Shift minVolunteers must be a non-negative integer'
    );
  });

  it('throws an error if maxVolunteers is missing', () => {
    const formData = createFormData({
      teamId: 'team-123',
      title: 'Morning Shift',
      'startTime-day': '1',
      'startTime-time': '08:00',
      durationHours: '4',
      minVolunteers: '2',
      isActive: 'on'
    });

    expect(() => validateNewShift(formData)).toThrow('Shift maxVolunteers is required');
  });

  it('throws an error if maxVolunteers is less than minVolunteers', () => {
    const formData = createFormData({
      teamId: 'team-123',
      title: 'Morning Shift',
      'startTime-day': '1',
      'startTime-time': '08:00',
      durationHours: '4',
      minVolunteers: '5',
      maxVolunteers: '2',
      isActive: 'on'
    });

    expect(() => validateNewShift(formData)).toThrow(
      'Shift maxVolunteers must be an integer greater than or equal to minVolunteers'
    );
  });

  it('sets isActive to false if not provided', () => {
    const formData = createFormData({
      teamId: 'team-123',
      title: 'Morning Shift',
      'startTime-day': '1',
      'startTime-time': '08:00',
      durationHours: '4',
      minVolunteers: '2',
      maxVolunteers: '5'
    });

    const result = validateNewShift(formData);

    expect(result.isActive).toBe(false);
  });
});
