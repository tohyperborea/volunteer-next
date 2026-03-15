import { deduplicateBy } from './list';

describe('deduplicateBy', () => {
  it('should return an empty array when given an empty array', () => {
    const result = deduplicateBy([], (item) => String(item));
    expect(result).toEqual([]);
  });

  it('should return the same array when there are no duplicates', () => {
    const input = [1, 2, 3];
    const result = deduplicateBy(input, (item) => item.toString());
    expect(result).toEqual(input);
  });

  it('should remove duplicates based on the key function', () => {
    const input = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 1, name: 'Alice' }
    ];
    const result = deduplicateBy(input, (item) => item.id.toString());
    expect(result).toEqual([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ]);
  });

  it('should handle strings as keys', () => {
    const input = ['apple', 'banana', 'apple', 'orange'];
    const result = deduplicateBy(input, (item) => item);
    expect(result).toEqual(['apple', 'banana', 'orange']);
  });

  it('should handle complex key functions', () => {
    const input = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Alice' }
    ];
    const result = deduplicateBy(input, (item) => item.name);
    expect(result).toEqual([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ]);
  });

  it('should preserve the order of the first occurrence of each unique item', () => {
    const input = [3, 1, 2, 3, 1, 4];
    const result = deduplicateBy(input, (item) => item.toString());
    expect(result).toEqual([3, 1, 2, 4]);
  });
});
