import { getEventDateRangeDisplayText, getListByDate } from './date';

describe('getEventDateRangeDisplayText', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should return the correct range when start and end dates are in the same month and year', () => {
    const event: EventInfo = {
      startDate: new Date(2023, 9, 10),
      endDate: new Date(2023, 9, 15),
      id: '',
      name: '',
      slug: ''
    };
    const result = getEventDateRangeDisplayText({ event }, 'en-CA');
    expect(result).toBe('Oct 10 - 15, 2023');
  });

  it('should return the correct range when start and end dates are in the same year but different months', () => {
    const event: EventInfo = {
      startDate: new Date(2023, 8, 25),
      endDate: new Date(2023, 9, 5),
      id: '',
      name: '',
      slug: ''
    };
    const result = getEventDateRangeDisplayText({ event }, 'en-CA');
    expect(result).toBe('Sep 25 - Oct 5, 2023');
  });

  it('should return the correct range when start and end dates are in different years', () => {
    const event: EventInfo = {
      startDate: new Date(2022, 11, 31),
      endDate: new Date(2023, 0, 1),
      id: '',
      name: '',
      slug: ''
    };
    const result = getEventDateRangeDisplayText({ event }, 'en-CA');
    expect(result).toBe('Dec 31, 2022 - Jan 1, 2023');
  });
});

describe('getListByDate', () => {
  it('should group items by their date', () => {
    const items = [
      { id: 1, date: new Date(2023, 9, 10) },
      { id: 2, date: new Date(2023, 9, 10) },
      { id: 3, date: new Date(2023, 9, 11) }
    ];
    const result = getListByDate(items, (item) => item.date, 'en-CA');
    expect(result).toEqual({
      'Tue, Oct 10, 2023': [
        { id: 1, date: new Date(2023, 9, 10) },
        { id: 2, date: new Date(2023, 9, 10) }
      ],
      'Wed, Oct 11, 2023': [{ id: 3, date: new Date(2023, 9, 11) }]
    });
  });

  it('should return an empty object when the input array is empty', () => {
    const result = getListByDate([], (item: any) => item.date, 'en-CA');
    expect(result).toEqual({});
  });

  it('should sort items by date before grouping', () => {
    const items = [
      { id: 1, date: new Date(2023, 9, 11) },
      { id: 2, date: new Date(2023, 9, 10) }
    ];
    const result = getListByDate(items, (item) => item.date, 'en-CA');
    expect(result).toEqual({
      'Tue, Oct 10, 2023': [{ id: 2, date: new Date(2023, 9, 10) }],
      'Wed, Oct 11, 2023': [{ id: 1, date: new Date(2023, 9, 11) }]
    });
  });
});
