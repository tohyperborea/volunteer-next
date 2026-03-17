import { teamFiltersToParams } from './team-filters';

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
