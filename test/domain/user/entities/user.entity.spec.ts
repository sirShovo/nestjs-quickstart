import { BadRequest, DomainErrorCode, Id } from '@/domain/common';
import { User } from '@/domain/user';

describe('UserEntity', () => {
  it('should be defined', () => {
    expect(User).toBeDefined();
  });

  describe('User#create', () => {
    it('should create a new user', () => {
      const unknownData: any = { id: Id.load(''), name: 'John Doe', email: 'john@doe.com' };

      const userResult = User.create(unknownData.id, unknownData.name, unknownData.email);
      expect(userResult.isSuccess()).toBeTruthy();
      expect(userResult.getOrThrow()).toBeInstanceOf(User);
    });

    it('should return USER_NAME_EMPTY error', () => {
      const unknownData: any = { id: Id.load(''), name: null, email: 'john@doe.com' };

      const userResult = User.create(unknownData.id, unknownData.name, unknownData.email);
      expect(userResult.isSuccess()).toBeFalsy();
      expect(() => userResult.getOrThrow()).toThrowError(BadRequest);

      const error = <BadRequest>userResult.exceptionOrNull();
      expect(error).toBeInstanceOf(BadRequest);
      expect(error.code).toBe(DomainErrorCode.USER_NAME_EMPTY.value);
    });

    it('should return USER_NAME_INVALID error', () => {
      const unknownData: any = { id: Id.load(''), name: {}, email: 'john@doe.com' };

      const userResult = User.create(unknownData.id, unknownData.name, unknownData.email);
      expect(userResult.isSuccess()).toBeFalsy();
      expect(() => userResult.getOrThrow()).toThrowError(BadRequest);

      const error = <BadRequest>userResult.exceptionOrNull();
      expect(error).toBeInstanceOf(BadRequest);
      expect(error.code).toBe(DomainErrorCode.USER_NAME_INVALID.value);
    });

    it('should return USER_EMAIL_EMPTY error', () => {
      const unknownData: any = { id: Id.load(''), name: 'John Doe', email: null };

      const userResult = User.create(unknownData.id, unknownData.name, unknownData.email);
      expect(userResult.isSuccess()).toBeFalsy();
      expect(() => userResult.getOrThrow()).toThrowError(BadRequest);

      const error = <BadRequest>userResult.exceptionOrNull();
      expect(error).toBeInstanceOf(BadRequest);
      expect(error.code).toBe(DomainErrorCode.USER_EMAIL_EMPTY.value);
    });

    it('should return USER_EMAIL_INVALID error', () => {
      const unknownData: any = { id: Id.load(''), name: 'John Doe', email: 'john@doe' };

      const userResult = User.create(unknownData.id, unknownData.name, unknownData.email);
      expect(userResult.isSuccess()).toBeFalsy();
      expect(() => userResult.getOrThrow()).toThrowError(BadRequest);

      const error = <BadRequest>userResult.exceptionOrNull();
      expect(error).toBeInstanceOf(BadRequest);
      expect(error.code).toBe(DomainErrorCode.USER_EMAIL_INVALID.value);
    });

    it('should return USER_CREATED_AT_INVALID error', () => {
      const unknownData: any = { id: Id.load(''), name: 'John Doe', email: 'john@doe.com', createdAt: '2020-02-30' };

      const userResult = User.create(unknownData.id, unknownData.name, unknownData.email, unknownData.createdAt);

      expect(userResult.isSuccess()).toBeFalsy();
      expect(() => userResult.getOrThrow()).toThrowError(BadRequest);

      const error = <BadRequest>userResult.exceptionOrNull();
      expect(error).toBeInstanceOf(BadRequest);
      expect(error.code).toBe(DomainErrorCode.USER_CREATED_AT_INVALID.value);
    });
  });

  describe('User#markAsDeleted', () => {
    it('should mark user as deleted', () => {
      const user = User.create(Id.load(''), 'John Doe', 'john@doe.com').getOrThrow();

      const now = new Date();
      const userResult = user.markAsDeleted(now);
      expect(userResult.isSuccess()).toBeTruthy();

      expect(user.deletedAt).toBeDefined();
      expect(user.deletedAt).toBeInstanceOf(Date);
      expect(user.deletedAt?.toISOString()).toBe(now.toISOString());
    });
  });
});
