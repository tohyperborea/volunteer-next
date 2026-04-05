import { paramsToUserFilters, recordToUserFilters, userFiltersToParams } from './user-filters';

describe('paramsToUserFilters', () => {
  it('should convert URLSearchParams to a UserFilters object', () => {
    const searchParams = new URLSearchParams({
      roleType: 'admin',
      searchQuery: 'test',
      showDeleted: 'true',
      withQualification: 'certified',
      withoutQualification: 'uncertified',
      onTeam: 'team123',
      eventHours: '5'
    });

    const result = paramsToUserFilters(searchParams);

    expect(result).toEqual({
      roleType: 'admin',
      searchQuery: 'test',
      showDeleted: true,
      withQualification: 'certified',
      withoutQualification: 'uncertified',
      onTeam: 'team123',
      eventHours: 5
    });
  });

  it('should handle missing parameters gracefully', () => {
    const searchParams = new URLSearchParams();

    const result = paramsToUserFilters(searchParams);

    expect(result).toEqual({
      roleType: undefined,
      searchQuery: undefined,
      showDeleted: false,
      withQualification: undefined,
      withoutQualification: undefined,
      onTeam: undefined,
      eventHours: undefined
    });
  });
});

describe('userFiltersToParams', () => {
  it('should convert a UserFilters object to URLSearchParams', () => {
    const filters: UserFilters = {
      roleType: 'admin',
      searchQuery: 'test',
      showDeleted: true,
      withQualification: 'certified',
      withoutQualification: 'uncertified',
      onTeam: 'team123',
      eventHours: undefined
    };

    const result = userFiltersToParams(filters);

    expect(result.toString()).toBe(
      'roleType=admin&searchQuery=test&showDeleted=true&withQualification=certified&withoutQualification=uncertified&onTeam=team123'
    );
  });

  it('should handle undefined values by removing corresponding parameters', () => {
    const filters = {
      roleType: undefined,
      searchQuery: undefined,
      showDeleted: false,
      withQualification: undefined,
      withoutQualification: undefined,
      onTeam: undefined,
      eventHours: undefined
    };

    const result = userFiltersToParams(filters);

    expect(result.toString()).toBe('');
  });

  it('should merge with existing URLSearchParams', () => {
    const filters: UserFilters = {
      roleType: 'admin',
      searchQuery: 'test',
      showDeleted: true,
      withQualification: undefined,
      withoutQualification: undefined,
      eventHours: undefined
    };
    const existingParams = new URLSearchParams({ page: '1', sort: 'asc' });

    const result = userFiltersToParams(filters, existingParams);

    expect(result.toString()).toBe(
      'page=1&sort=asc&roleType=admin&searchQuery=test&showDeleted=true'
    );
  });
});

describe('recordToUserFilters', () => {
  it('should convert a record to a UserFilters object', () => {
    const record = {
      roleType: 'admin',
      searchQuery: 'test',
      showDeleted: 'true',
      withQualification: 'certified',
      withoutQualification: 'uncertified',
      onTeam: 'team123',
      eventHours: undefined
    };

    const result = recordToUserFilters(record);

    expect(result).toEqual({
      roleType: 'admin',
      searchQuery: 'test',
      showDeleted: true,
      withQualification: 'certified',
      withoutQualification: 'uncertified',
      onTeam: 'team123',
      eventHours: undefined
    });
  });

  it('should handle missing or undefined values gracefully', () => {
    const record = {
      roleType: undefined,
      searchQuery: undefined,
      showDeleted: undefined,
      withQualification: undefined,
      withoutQualification: undefined,
      onTeam: undefined,
      eventHours: undefined
    };

    const result = recordToUserFilters(record);

    expect(result).toEqual({
      roleType: undefined,
      searchQuery: undefined,
      showDeleted: false,
      withQualification: undefined,
      withoutQualification: undefined,
      onTeam: undefined,
      eventHours: undefined
    });
  });

  it('should handle partial records', () => {
    const record = {
      roleType: 'user',
      searchQuery: undefined,
      showDeleted: 'false',
      withQualification: 'certified',
      withoutQualification: undefined,
      onTeam: undefined
    };

    const result = recordToUserFilters(record);

    expect(result).toEqual({
      roleType: 'user',
      searchQuery: undefined,
      showDeleted: false,
      withQualification: 'certified',
      withoutQualification: undefined,
      onTeam: undefined
    });
  });
});
