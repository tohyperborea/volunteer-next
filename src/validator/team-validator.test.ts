import { validateExistingTeam, validateNewTeam } from './team-validator';

describe('validateExistingTeam', () => {
  it('should validate and return a team with an ID', () => {
    const formData = new FormData();
    formData.append('id', '123');
    formData.append('name', 'Team A');
    formData.append('slug', 'team-a');
    formData.append('description', 'A great team');
    formData.append('contactAddress', 'team@example.com');
    formData.append('eventId', '456');

    const result = validateExistingTeam(formData);

    expect(result).toEqual({
      id: '123',
      name: 'Team A',
      slug: 'team-a',
      description: 'A great team',
      contactAddress: 'team@example.com',
      eventId: '456'
    });
  });

  it('should throw an error if ID is missing', () => {
    const formData = new FormData();
    formData.append('name', 'Team A');
    formData.append('slug', 'team-a');
    formData.append('description', 'A great team');
    formData.append('contactAddress', 'team@example.com');
    formData.append('eventId', '456');

    expect(() => validateExistingTeam(formData)).toThrow('Team ID is required');
  });
});

describe('validateNewTeam', () => {
  it('should validate and return a team without an ID', () => {
    const formData = new FormData();
    formData.append('name', 'Team A');
    formData.append('slug', 'team-a');
    formData.append('description', 'A great team');
    formData.append('contactAddress', 'team@example.com');
    formData.append('eventId', '456');

    const result = validateNewTeam(formData);

    expect(result).toEqual({
      name: 'Team A',
      slug: 'team-a',
      description: 'A great team',
      contactAddress: 'team@example.com',
      eventId: '456'
    });
  });

  it('should throw an error if name is missing', () => {
    const formData = new FormData();
    formData.append('slug', 'team-a');
    formData.append('description', 'A great team');
    formData.append('contactAddress', 'team@example.com');
    formData.append('eventId', '456');

    expect(() => validateNewTeam(formData)).toThrow('Team name is required');
  });

  it('should throw an error if slug is missing', () => {
    const formData = new FormData();
    formData.append('name', 'Team A');
    formData.append('description', 'A great team');
    formData.append('contactAddress', 'team@example.com');
    formData.append('eventId', '456');

    expect(() => validateNewTeam(formData)).toThrow('Team slug is required');
  });

  it('should throw an error if slug contains illegal characters', () => {
    const formData = new FormData();
    formData.append('name', 'Team A');
    formData.append('slug', '"slug< w~ith >ba&d | char\\ac`ters% a?nd [{spaces}]^');
    formData.append('description', 'A great team');
    formData.append('contactAddress', 'team@example.com');
    formData.append('eventId', '456');

    expect(() => validateNewTeam(formData)).toThrow('Team slug contains invalid characters');
  });

  it('should throw an error if description is missing', () => {
    const formData = new FormData();
    formData.append('name', 'Team A');
    formData.append('slug', 'team-a');
    formData.append('contactAddress', 'team@example.com');
    formData.append('eventId', '456');

    expect(() => validateNewTeam(formData)).toThrow('Team description is required');
  });

  it('should throw an error if contact address is missing', () => {
    const formData = new FormData();
    formData.append('name', 'Team A');
    formData.append('slug', 'team-a');
    formData.append('description', 'A great team');
    formData.append('eventId', '456');

    expect(() => validateNewTeam(formData)).toThrow('Team contact address is required');
  });

  it('should throw an error if contact address is not a valid email', () => {
    const formData = new FormData();
    formData.append('name', 'Team A');
    formData.append('slug', 'team-a');
    formData.append('description', 'A great team');
    formData.append('contactAddress', 'invalid-email');
    formData.append('eventId', '456');

    expect(() => validateNewTeam(formData)).toThrow('Team contact address must be a valid email');
  });

  it('should throw an error if eventId is missing', () => {
    const formData = new FormData();
    formData.append('name', 'Team A');
    formData.append('slug', 'team-a');
    formData.append('description', 'A great team');
    formData.append('contactAddress', 'team@example.com');

    expect(() => validateNewTeam(formData)).toThrow('Team eventId is required');
  });
});
