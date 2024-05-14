import { Validator } from '@/domain/common';

describe('Validator', () => {
  describe('mapIfPresent', () => {
    it('it should return a Date object', async () => {
      const result = Validator.of('2021-01-01').mapIfPresent((date) => new Date(date));
      expect(result.getOrThrow().toISOString()).toBe(new Date('2021-01-01').toISOString());
    });

    it('it should return null', async () => {
      const result = Validator.of(null).mapIfPresent((date) => new Date(date));
      expect(result.getOrThrow()).toBe(null);
    });
  });

  describe('mapIfAbsent', () => {
    it('it should return a Date object', async () => {
      const result = Validator.of(null).mapIfAbsent(() => new Date('2021-01-01'));
      expect(result.getOrThrow().toISOString()).toBe(new Date('2021-01-01').toISOString());
    });

    it('it should return null', async () => {
      const result = Validator.of('2021-01-01').mapIfAbsent(() => null);
      expect(result.getOrThrow()).toBe('2021-01-01');
    });
  });
});
