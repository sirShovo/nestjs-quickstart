import { DomainErrorCode } from '@/domain/common';

describe('ErrorCodes', () => {
  function findDuplicates(elements: string[]) {
    return elements.filter((item, index) => elements.indexOf(item) !== index);
  }

  describe('DuplicatedCodes', () => {
    it('it should return an empty array', async () => {
      const domainErrorCodeMethods = Object.getOwnPropertyNames(DomainErrorCode).filter(
        (prop) => typeof (DomainErrorCode as any)[prop] === 'object' && prop !== 'prototype',
      );
      const codes = domainErrorCodeMethods.map((method) => (DomainErrorCode as any)[method].value);

      const duplicates = findDuplicates(codes);

      expect(duplicates).toEqual([]);
    });
  });
});
