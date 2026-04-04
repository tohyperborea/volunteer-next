import { paramsToEventFilters, recordToEventFilters, eventFiltersToParams } from './event-filters';

describe('paramsToEventFilters', () => {
  it('should convert URLSearchParams to EventFilters object', () => {
    const searchParams = new URLSearchParams({
      searchQuery: 'test',
      showArchived: 'true'
    });

    const result = paramsToEventFilters(searchParams);

    expect(result).toEqual({
      searchQuery: 'test',
      showArchived: true
    });
  });

  it('should handle missing parameters gracefully', () => {
    const searchParams = new URLSearchParams();

    const result = paramsToEventFilters(searchParams);

    expect(result).toEqual({
      searchQuery: undefined,
      showArchived: false
    });
  });
});

describe('recordToEventFilters', () => {
  it('should convert a record to EventFilters object', () => {
    const record = {
      searchQuery: '  test  ',
      showArchived: 'true'
    };

    const result = recordToEventFilters(record);

    expect(result).toEqual({
      searchQuery: 'test',
      showArchived: true
    });
  });

  it('should handle empty or undefined searchQuery', () => {
    const record = {
      searchQuery: '',
      showArchived: 'false'
    };

    const result = recordToEventFilters(record);

    expect(result).toEqual({
      searchQuery: undefined,
      showArchived: false
    });
  });
});

describe('eventFiltersToParams', () => {
  it('should convert EventFilters to URLSearchParams', () => {
    const filters = {
      searchQuery: 'test',
      showArchived: true
    };

    const result = eventFiltersToParams(filters);

    expect(result.get('searchQuery')).toBe('test');
    expect(result.get('showArchived')).toBe('true');
  });

  it('should handle undefined or false values in EventFilters', () => {
    const filters = {
      searchQuery: undefined,
      showArchived: false
    };

    const result = eventFiltersToParams(filters);

    expect(result.has('searchQuery')).toBe(false);
    expect(result.has('showArchived')).toBe(false);
  });

  it('should merge with existing URLSearchParams', () => {
    const filters = {
      searchQuery: 'newQuery',
      showArchived: true
    };
    const existing = new URLSearchParams({
      otherParam: 'value'
    });

    const result = eventFiltersToParams(filters, existing);

    expect(result.get('searchQuery')).toBe('newQuery');
    expect(result.get('showArchived')).toBe('true');
    expect(result.get('otherParam')).toBe('value');
  });
});
