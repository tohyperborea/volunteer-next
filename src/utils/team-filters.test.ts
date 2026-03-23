import { paramsToTeamFilters, recordToTeamFilters, teamFiltersToParams } from './team-filters';

describe('teamFiltersToParams', () => {
  it('should convert a TeamFilters object to URLSearchParams', () => {
    const filters = { searchQuery: 'test' };
    const result = teamFiltersToParams(filters);
    expect(result.get('searchQuery')).toBe('test');
  });

  it('should handle undefined searchQuery by removing the parameter', () => {
    const filters = { searchQuery: undefined };
    const existingParams = new URLSearchParams({ searchQuery: 'existing' });
    const result = teamFiltersToParams(filters, existingParams);
    expect(result.has('searchQuery')).toBe(false);
  });

  it('should merge with existing URLSearchParams', () => {
    const filters = { searchQuery: 'newQuery' };
    const existingParams = new URLSearchParams({ otherParam: 'value' });
    const result = teamFiltersToParams(filters, existingParams);
    expect(result.get('searchQuery')).toBe('newQuery');
    expect(result.get('otherParam')).toBe('value');
  });

  it('should overwrite existing searchQuery in URLSearchParams', () => {
    const filters = { searchQuery: 'updatedQuery' };
    const existingParams = new URLSearchParams({ searchQuery: 'oldQuery' });
    const result = teamFiltersToParams(filters, existingParams);
    expect(result.get('searchQuery')).toBe('updatedQuery');
  });

  it('should return an empty URLSearchParams if filters are empty and no existing params', () => {
    const filters = { searchQuery: undefined };
    const result = teamFiltersToParams(filters);
    expect(result.toString()).toBe('');
  });
});
describe('paramsToTeamFilters', () => {
  it('should convert URLSearchParams to a TeamFilters object', () => {
    const searchParams = new URLSearchParams({ searchQuery: 'testQuery' });
    const result = paramsToTeamFilters(searchParams);
    expect(result).toEqual({ searchQuery: 'testQuery' });
  });

  it('should return undefined for searchQuery if it is not present in URLSearchParams', () => {
    const searchParams = new URLSearchParams();
    const result = paramsToTeamFilters(searchParams);
    expect(result).toEqual({ searchQuery: undefined });
  });
});

describe('recordToTeamFilters', () => {
  it('should convert a record to a TeamFilters object', () => {
    const record = { searchQuery: 'testQuery' };
    const result = recordToTeamFilters(record);
    expect(result).toEqual({ searchQuery: 'testQuery' });
  });

  it('should handle undefined values in the record', () => {
    const record = { searchQuery: undefined };
    const result = recordToTeamFilters(record);
    expect(result).toEqual({ searchQuery: undefined });
  });

  it('should handle string arrays in the record by normalizing them', () => {
    const record = { searchQuery: ['query1', 'query2'] };
    const result = recordToTeamFilters(record);
    expect(result).toEqual({ searchQuery: 'query1' });
  });

  it('should handle empty string values as undefined', () => {
    const record = { searchQuery: '' };
    const result = recordToTeamFilters(record);
    expect(result).toEqual({ searchQuery: undefined });
  });
});
