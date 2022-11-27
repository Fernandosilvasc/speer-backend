import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import UserEntity from '../../../commons/persistence/user.entity';
import { UsersService } from '../users.service';
import UserFactory from './factories/user.factory';
import * as argon from 'argon2';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as _ from 'lodash';

type MockType<T> = {
  [P in keyof T]?: jest.Mock<string | unknown>;
};

jest.mock('argon2');

describe('UsersService', () => {
  let service: UsersService;
  let mockUserEntityRepository: MockType<Repository<UserEntity>>;

  beforeEach(async () => {
    jest.spyOn(argon, 'hash').mockReturnValue(Promise.resolve('hashedCode123'));
    const userEntityRepositoryMockFactory: () => MockType<
      Repository<UserEntity>
    > = jest.fn(() => ({
      save: jest.fn((entity) => entity),
      find: jest.fn((entity) => entity),
      findOneBy: jest.fn((entity) => entity),
    }));

    mockUserEntityRepository = userEntityRepositoryMockFactory();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserEntityRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('GIVEN data to create a user', () => {
    describe('AND username and password are provided', () => {
      const data = {
        username: 'testUsername',
        password: 'testPassword',
      };
      describe('WHEN the username has not already exists', () => {
        it('THEN it should create a new user', async () => {
          const user = UserFactory.build();
          const newUser = {
            username: user.username,
            hash: user.hash,
          };
          jest
            .spyOn(mockUserEntityRepository, 'findOneBy')
            .mockReturnValue(undefined);
          const spyUserRepository = jest.spyOn(
            mockUserEntityRepository,
            'save',
          );
          await service.create(data);
          expect(spyUserRepository).toBeCalledWith(newUser);
        });
      });
      describe('WHEN the username has already exists', () => {
        it('THEN it should throw a error', async () => {
          const mockExistingUser = UserFactory.build();
          jest
            .spyOn(mockUserEntityRepository, 'findOneBy')
            .mockReturnValue(mockExistingUser);
          await expect(service.create(data)).rejects.toThrowError(
            new ConflictException(`This username is already in use`),
          );
        });
      });
    });
  });

  describe('GIVEN data to find a user', () => {
    describe('WHEN a username is provided', () => {
      it('THEN it should return a existing user', async () => {
        const mockExistingUser = UserFactory.build();
        jest
          .spyOn(mockUserEntityRepository, 'findOneBy')
          .mockReturnValue(mockExistingUser);
        const spyGetUserByUsername = jest.spyOn(service, 'getUserByUsername');
        const received = await service.getUserByUsername(
          mockExistingUser.username,
        );
        expect(spyGetUserByUsername).toBeCalledWith(mockExistingUser.username);
        expect(received).toEqual(mockExistingUser);
      });
    });

    describe('WHEN a user id is provided', () => {
      it('THEN it should return a existing user', async () => {
        const mockExistingUser = UserFactory.build();
        jest
          .spyOn(mockUserEntityRepository, 'findOneBy')
          .mockReturnValue(mockExistingUser);
        const spyGetUserByUsername = jest.spyOn(service, 'getUserById');
        const received = await service.getUserById(mockExistingUser.id);
        expect(spyGetUserByUsername).toBeCalledWith(mockExistingUser.id);
        expect(received).toEqual(mockExistingUser);
      });
    });
  });

  describe('GIVEN data to update a user', () => {
    describe('WHEN the user id is valid', () => {
      it('THEN it should update the respective user', async () => {
        const mockExistingUser = UserFactory.build({ hashedRT: 'test' });
        const updatedUser = {
          ...mockExistingUser,
          username: 'usernameUpdated',
        };
        jest
          .spyOn(service, 'getUserById')
          .mockReturnValue(Promise.resolve(mockExistingUser));
        const spyUserRepository = jest.spyOn(mockUserEntityRepository, 'save');
        await service.update(updatedUser);
        expect(spyUserRepository).toBeCalledWith(updatedUser);
      });
    });
    describe('WHEN the user is is not valid', () => {
      it('THEN it should throw a Not Found Exception', async () => {
        const mockedUser = UserFactory.build();
        jest.spyOn(service, 'getUserById').mockImplementation();
        await expect(service.update(mockedUser)).rejects.toThrowError(
          new NotFoundException('No user has been found with the given id'),
        );
      });
    });
  });
});
