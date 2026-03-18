import { paramsToShiftFilters, recordToShiftFilters, shiftFiltersToParams } from './shift-filters';

describe('shiftFiltersToParams', () => {
  it('should convert a TeamFilters object to URLSearchParams', () => {
    const filters = { searchQuery: 'test' };
    const result = shiftFiltersToParams(filters);
    expect(result.get('searchQuery')).toBe('test');
  });

  it('should handle undefined searchQuery by removing the parameter', () => {
    const filters = { searchQuery: undefined };
    const existingParams = new URLSearchParams({ searchQuery: 'existing' });
    const result = shiftFiltersToParams(filters, existingParams);
    expect(result.has('searchQuery')).toBe(false);
  });

  it('should merge with existing URLSearchParams', () => {
    const filters = { searchQuery: 'newQuery' };
    const existingParams = new URLSearchParams({ otherParam: 'value' });
    const result = shiftFiltersToParams(filters, existingParams);
    expect(result.get('searchQuery')).toBe('newQuery');
    expect(result.get('otherParam')).toBe('value');
  });

  it('should overwrite existing searchQuery in URLSearchParams', () => {
    const filters = { searchQuery: 'updatedQuery' };
    const existingParams = new URLSearchParams({ searchQuery: 'oldQuery' });
    const result = shiftFiltersToParams(filters, existingParams);
    expect(result.get('searchQuery')).toBe('updatedQuery');
  });

  it('should return an empty URLSearchParams if filters are empty and no existing params', () => {
    const filters = { searchQuery: undefined };
    const result = shiftFiltersToParams(filters);
    expect(result.toString()).toBe('');
  });
});
describe('paramsToShiftFilters', () => {
  it('should convert URLSearchParams to a ShiftFilters object', () => {
    const searchParams = new URLSearchParams({ searchQuery: 'testQuery' });
    const result = paramsToShiftFilters(searchParams);
    expect(result).toEqual({ searchQuery: 'testQuery' });
  });

  it('should return undefined for searchQuery if the parameter is not present', () => {
    const searchParams = new URLSearchParams();
    const result = paramsToShiftFilters(searchParams);
    expect(result).toEqual({ searchQuery: undefined });
  });

  it('should handle empty string values as undefined', () => {
    const searchParams = new URLSearchParams({ searchQuery: '' });
    const result = paramsToShiftFilters(searchParams);
    expect(result).toEqual({ searchQuery: undefined });
  });
});

describe('recordToShiftFilters', () => {
  it('should convert a record to a ShiftFilters object', () => {
    const record = { searchQuery: 'testQuery' };
    const result = recordToShiftFilters(record);
    expect(result).toEqual({ searchQuery: 'testQuery' });
  });

  it('should handle undefined values in the record', () => {
    const record = { searchQuery: undefined };
    const result = recordToShiftFilters(record);
    expect(result).toEqual({ searchQuery: undefined });
  });

  it('should handle array values by normalizing to a single string', () => {
    const record = { searchQuery: ['value1', 'value2'] };
    const result = recordToShiftFilters(record);
    expect(result).toEqual({ searchQuery: 'value1' });
  });

  it('should handle empty string values as undefined', () => {
    const record = { searchQuery: '' };
    const result = recordToShiftFilters(record);
    expect(result).toEqual({ searchQuery: undefined });
  });
});
