import { Test } from '@nestjs/testing';
import { UsersService } from '../../users/services/users.service';
import { AuthService } from './auth.service';
import UserFactory from '../../users/services/__test/factories/user.factory';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../../commons/config/config.service';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import * as argon2 from 'argon2';

jest.mock('argon2');

describe('AuthService', () => {
  let service: AuthService;
  let usersServiceMock: Partial<UsersService>;
  let jwtServiceMock: Partial<JwtService>;

  const user = {
    username: 'testUsername',
    password: 'testPassword',
  };
  const tokens = {
    access_token: 'testAccessToken',
    refresh_token: 'testRefreshToken',
  };

  beforeEach(async () => {
    usersServiceMock = {
      create: jest.fn(),
      update: jest.fn(),
      getUserByUsername: jest.fn(),
      getUserById: jest.fn(),
    };

    jwtServiceMock = {
      signAsync: jest.fn(),
    };

    const providers = [
      AuthService,
      ConfigService,
      {
        provide: JwtService,
        useValue: jwtServiceMock,
      },
      {
        provide: UsersService,
        useValue: usersServiceMock,
      },
    ];

    const module = await Test.createTestingModule({
      providers,
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('WHEN user data is provided to authenticate', () => {
    describe('AND user has not signup yet', () => {
      describe('WHEN the username is not taken yet', () => {
        it('THEN the user should sign up first to have access in the application', async () => {
          const createdUser = UserFactory.build();
          jest
            .spyOn(usersServiceMock, 'create')
            .mockReturnValue(Promise.resolve(createdUser));
          jest
            .spyOn(service, 'getTokens')
            .mockReturnValue(Promise.resolve(tokens));
          jest.spyOn(service, 'updateUserRtHash').getMockImplementation();
          const received = await service.signupLocal(user);
          const spyUpdateRtHash = jest.spyOn(service, 'updateUserRtHash');

          expect(received).toEqual(tokens);
          expect(spyUpdateRtHash).toBeCalledWith(
            createdUser.id,
            tokens.refresh_token,
          );
        });
      });
      describe('WHEN the username has already been taken', () => {
        it('THEN it should throw a Conflict Exception error', async () => {
          const conflictExceptionError = new ConflictException(
            'This username is already in use',
          );
          jest
            .spyOn(usersServiceMock, 'create')
            .mockRejectedValue(conflictExceptionError);
          await expect(service.signupLocal(user)).rejects.toThrowError(
            conflictExceptionError,
          );
        });
      });
    });
    describe('AND user has already been signup', () => {
      describe("WHEN the user's password does match", () => {
        it('THEN it should sign in the user', async () => {
          const existingUser = UserFactory.build();
          jest
            .spyOn(usersServiceMock, 'getUserByUsername')
            .mockReturnValue(Promise.resolve(existingUser));
          jest.spyOn(argon2, 'verify').mockReturnValue(Promise.resolve(true));
          jest
            .spyOn(service, 'getTokens')
            .mockReturnValue(Promise.resolve(tokens));
          jest.spyOn(service, 'updateUserRtHash').getMockImplementation();
          const received = await service.signinLocal(user);
          expect(received).toEqual(tokens);
          const spyUpdateRtHash = jest.spyOn(service, 'updateUserRtHash');
          expect(spyUpdateRtHash).toBeCalledWith(
            existingUser.id,
            tokens.refresh_token,
          );
        });
      });
      describe("WHEN the user's password doesn't match", () => {
        it('THEN it should throw Forbidden Exception error', async () => {
          const existingUser = UserFactory.build();
          jest
            .spyOn(usersServiceMock, 'getUserByUsername')
            .mockReturnValue(Promise.resolve(existingUser));
          jest.spyOn(argon2, 'verify').mockReturnValue(Promise.resolve(false));
          await expect(service.signinLocal(user)).rejects.toThrowError(
            new ForbiddenException('Access Denied'),
          );
        });
      });
    });
  });

  describe('WHEN user attempts to logout', () => {
    describe('AND the user id provided is valid', () => {
      it('THEN it should log out the user', async () => {
        const existingUser = UserFactory.build();
        jest.spyOn(usersServiceMock, 'update').getMockImplementation();
        const received = await service.logout(existingUser.id);
        expect(received).toBe(true);
      });
    });
    describe('AND the user provided is not valid', () => {
      it('THEN it should throw new Not Found Exception error', async () => {
        const existingUser = UserFactory.build();
        const notFoundExceptionError = new NotFoundException(
          'No user has been found with the given id',
        );
        jest
          .spyOn(usersServiceMock, 'update')
          .mockRejectedValue(notFoundExceptionError);
        await expect(service.logout(existingUser.id)).rejects.toThrowError(
          notFoundExceptionError,
        );
      });
    });
  });

  describe('WHEN user data are given to get tokens', () => {
    it('THEN it should return the tokens', async () => {
      const existingUser = UserFactory.build();
      jest
        .spyOn(jwtServiceMock, 'signAsync')
        .mockResolvedValueOnce(tokens.access_token)
        .mockResolvedValueOnce(tokens.refresh_token);

      const received = await service.getTokens(
        existingUser.id,
        existingUser.username,
      );
      expect(received).toEqual(tokens);
    });
  });

  describe("WHEN data is given to get a new user's refresh token", () => {
    const existingUser = UserFactory.build({ hashedRT: 'userHashedRT' });
    describe('AND user has a existing refresh token', () => {
      it('THEN it should return a refresh token', async () => {
        jest
          .spyOn(usersServiceMock, 'getUserById')
          .mockResolvedValue(existingUser);
        jest.spyOn(argon2, 'verify').mockReturnValue(Promise.resolve(true));
        jest
          .spyOn(service, 'getTokens')
          .mockReturnValue(Promise.resolve(tokens));
        jest.spyOn(service, 'updateUserRtHash').getMockImplementation();
        const received = await service.getRefreshTokens(
          existingUser.id,
          existingUser.hashedRT!,
        );
        expect(received).toEqual(tokens);
      });
    });

    describe('AND user has not a valid refresh token', () => {
      it('THEN it should throw a Forbidden Exception error', async () => {
        jest
          .spyOn(usersServiceMock, 'getUserById')
          .mockResolvedValue(existingUser);
        jest.spyOn(argon2, 'verify').mockReturnValue(Promise.resolve(false));
        await expect(
          service.getRefreshTokens(existingUser.id, existingUser.hashedRT!),
        ).rejects.toThrowError(new ForbiddenException('Access Denied'));
      });
    });
  });

  describe("WHEN data is given to update the user's refresh token", () => {
    describe('AND the user id provided is valid', () => {
      it("THEN it should update the user's refresh token ", async () => {
        const existingUser = UserFactory.build({ hashedRT: 'userHashedRT' });
        const hashedRefreshToken = 'hashedCode123';
        jest
          .spyOn(usersServiceMock, 'getUserById')
          .mockResolvedValue(existingUser);
        jest
          .spyOn(argon2, 'hash')
          .mockReturnValue(Promise.resolve(hashedRefreshToken));
        jest.spyOn(usersServiceMock, 'update').mockImplementation();

        const spyUsersService = jest.spyOn(usersServiceMock, 'update');
        existingUser.hashedRT = hashedRefreshToken;

        await service.updateUserRtHash(existingUser.id, 'testRefreshToken');
        expect(spyUsersService).toBeCalledWith({
          id: existingUser.id,
          hashedRT: existingUser.hashedRT,
        });
      });
    });
    describe('AND the user id provided is not valid', () => {
      it('THEN it should throw new Not Found Exception error', async () => {
        const existingUser = UserFactory.build();
        const notFoundExceptionError = new NotFoundException(
          'No user has been found with the given id',
        );
        jest
          .spyOn(usersServiceMock, 'update')
          .mockRejectedValue(notFoundExceptionError);
        await expect(
          service.updateUserRtHash(existingUser.id, 'userHashedRT'),
        ).rejects.toThrowError(notFoundExceptionError);
      });
    });
  });
});
