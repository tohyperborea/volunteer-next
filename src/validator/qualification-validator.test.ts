import { validateNewQualification } from './qualification-validator';

describe('validateNewQualification', () => {
  it('should validate and return the qualification info when all fields are valid', () => {
    const formData = new FormData();
    formData.set('name', 'Qualification Name');
    formData.set('eventId', '12345');
    formData.set('teamId', '67890');
    formData.set('errorMessage', 'Some error message');

    const result = validateNewQualification(formData);

    expect(result).toEqual({
      name: 'Qualification Name',
      eventId: '12345',
      teamId: '67890',
      errorMessage: 'Some error message'
    });
  });

  it('should throw an error if the name field is missing', () => {
    const formData = new FormData();
    formData.set('eventId', '12345');
    formData.set('teamId', '67890');
    formData.set('errorMessage', 'Some error message');

    expect(() => validateNewQualification(formData)).toThrow('Qualification name is required');
  });

  it('should throw an error if the eventId field is missing', () => {
    const formData = new FormData();
    formData.set('name', 'Qualification Name');
    formData.set('teamId', '67890');
    formData.set('errorMessage', 'Some error message');

    expect(() => validateNewQualification(formData)).toThrow('Event ID is required');
  });

  it('should set teamId to undefined if the value is "null"', () => {
    const formData = new FormData();
    formData.set('name', 'Qualification Name');
    formData.set('eventId', '12345');
    formData.set('teamId', 'null');
    formData.set('errorMessage', 'Some error message');

    const result = validateNewQualification(formData);

    expect(result).toEqual({
      name: 'Qualification Name',
      eventId: '12345',
      teamId: undefined,
      errorMessage: 'Some error message'
    });
  });

  it('should throw an error if the errorMessage field is missing', () => {
    const formData = new FormData();
    formData.set('name', 'Qualification Name');
    formData.set('eventId', '12345');
    formData.set('teamId', '67890');

    expect(() => validateNewQualification(formData)).toThrow('Error message is required');
  });
});
