import { paramsToShiftFilters, recordToShiftFilters, shiftFiltersToParams } from './shift-filters';

describe('shiftFiltersToParams', () => {
  it('should convert a ShiftFilters object to URLSearchParams', () => {
    const filters = { searchQuery: 'test', teamId: 'team1' };
    const result = shiftFiltersToParams(filters);
    expect(result.get('searchQuery')).toBe('test');
    expect(result.get('teamId')).toBe('team1');
  });

  it('should handle undefined searchQuery by removing the parameter', () => {
    const filters = { searchQuery: undefined, teamId: undefined };
    const existingParams = new URLSearchParams({ searchQuery: 'existing', teamId: 'existingTeam' });
    const result = shiftFiltersToParams(filters, existingParams);
    expect(result.has('searchQuery')).toBe(false);
    expect(result.has('teamId')).toBe(false);
  });

  it('should merge with existing URLSearchParams', () => {
    const filters = { searchQuery: 'newQuery', teamId: 'newTeam' };
    const existingParams = new URLSearchParams({ otherParam: 'value' });
    const result = shiftFiltersToParams(filters, existingParams);
    expect(result.get('searchQuery')).toBe('newQuery');
    expect(result.get('teamId')).toBe('newTeam');
    expect(result.get('otherParam')).toBe('value');
  });

  it('should overwrite existing searchQuery in URLSearchParams', () => {
    const filters = { searchQuery: 'updatedQuery', teamId: 'updatedTeam' };
    const existingParams = new URLSearchParams({ searchQuery: 'oldQuery', teamId: 'oldTeam' });
    const result = shiftFiltersToParams(filters, existingParams);
    expect(result.get('searchQuery')).toBe('updatedQuery');
    expect(result.get('teamId')).toBe('updatedTeam');
  });

  it('should return an empty URLSearchParams if filters are empty and no existing params', () => {
    const filters = { searchQuery: undefined, teamId: undefined };
    const result = shiftFiltersToParams(filters);
    expect(result.toString()).toBe('');
  });
});
describe('paramsToShiftFilters', () => {
  it('should convert URLSearchParams to a ShiftFilters object', () => {
    const searchParams = new URLSearchParams({ searchQuery: 'testQuery', teamId: 'team1' });
    const result = paramsToShiftFilters(searchParams);
    expect(result).toEqual({ searchQuery: 'testQuery', teamId: 'team1' });
  });

  it('should return undefined for searchQuery if the parameter is not present', () => {
    const searchParams = new URLSearchParams();
    const result = paramsToShiftFilters(searchParams);
    expect(result).toEqual({ searchQuery: undefined, teamId: undefined });
  });

  it('should handle empty string values as undefined', () => {
    const searchParams = new URLSearchParams({ searchQuery: '', teamId: '' });
    const result = paramsToShiftFilters(searchParams);
    expect(result).toEqual({ searchQuery: undefined, teamId: undefined });
  });
});

describe('recordToShiftFilters', () => {
  it('should convert a record to a ShiftFilters object', () => {
    const record = { searchQuery: 'testQuery', teamId: 'team1' };
    const result = recordToShiftFilters(record);
    expect(result).toEqual({ searchQuery: 'testQuery', teamId: 'team1' });
  });

  it('should handle undefined values in the record', () => {
    const record = { searchQuery: undefined, teamId: undefined };
    const result = recordToShiftFilters(record);
    expect(result).toEqual({ searchQuery: undefined, teamId: undefined });
  });

  it('should handle array values by normalizing to a single string', () => {
    const record = { searchQuery: ['value1', 'value2'], teamId: ['team1', 'team2'] };
    const result = recordToShiftFilters(record);
    expect(result).toEqual({ searchQuery: 'value1', teamId: 'team1' });
  });

  it('should handle empty string values as undefined', () => {
    const record = { searchQuery: '', teamId: '' };
    const result = recordToShiftFilters(record);
    expect(result).toEqual({ searchQuery: undefined, teamId: undefined });
  });
});
