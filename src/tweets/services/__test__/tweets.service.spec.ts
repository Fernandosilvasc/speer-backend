import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from '../../../users/services/users.service';
import { Repository } from 'typeorm';
import TweetEntity from '../../../commons/persistence/tweet.entity';
import { TweetsService } from '../tweets.service';
import UserFactory from '../../../users/services/__test__/factories/user.factory';
import TweetFactory from './factories/tweet.factory';
import { NotFoundException } from '@nestjs/common';

type MockType<T> = {
  [P in keyof T]?: jest.Mock<string | unknown>;
};

describe('TweetService', () => {
  let service: TweetsService;
  let mockTweetEntityRepository: MockType<Repository<TweetEntity>>;
  let usersServiceMock: Partial<UsersService>;

  beforeEach(async () => {
    const tweetEntityRepositoryMockFactory: () => MockType<
      Repository<TweetEntity>
    > = jest.fn(() => ({
      save: jest.fn((entity) => entity),
      findOneBy: jest.fn((entity) => entity),
      delete: jest.fn((entity) => entity),
    }));

    mockTweetEntityRepository = tweetEntityRepositoryMockFactory();

    usersServiceMock = {
      getUserById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TweetsService,
        {
          provide: getRepositoryToken(TweetEntity),
          useValue: mockTweetEntityRepository,
        },
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
      ],
    }).compile();

    service = module.get<TweetsService>(TweetsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('WHEN data is provided to create a tweet', () => {
    describe('AND the provided user id is valid', () => {
      it('THEN it should create a tweet', async () => {
        const existingUser = UserFactory.build();
        const newTweet = TweetFactory.build({ authorId: existingUser.id });
        jest
          .spyOn(usersServiceMock, 'getUserById')
          .mockReturnValue(Promise.resolve(existingUser));
        jest.spyOn(mockTweetEntityRepository, 'save').mockReturnValue(newTweet);
        const spyTweetRepository = jest.spyOn(
          mockTweetEntityRepository,
          'save',
        );
        const received = await service.create(existingUser.id, newTweet.text);
        expect(spyTweetRepository).toBeCalledWith({
          authorId: newTweet.authorId,
          text: newTweet.text,
        });
        expect(received).toEqual(newTweet);
      });
    });
    describe('AND the provided user id is not valid', () => {
      it('THEN it should throw a Not Found Exception error', async () => {
        const newTweet = TweetFactory.build();
        const notFoundExceptionError = new NotFoundException(
          'No user has been found with the given id',
        );
        jest
          .spyOn(usersServiceMock, 'getUserById')
          .mockRejectedValue(notFoundExceptionError);
        await expect(service.create('123', newTweet.text)).rejects.toThrowError(
          notFoundExceptionError,
        );
      });
    });
  });

  describe('WHEN data is provided to update a tweet', () => {
    describe('AND the provided tweet id is valid', () => {
      it('THEN it should update a tweet', async () => {
        const existingTweet = TweetFactory.build();
        jest
          .spyOn(service, 'getTweetById')
          .mockReturnValue(Promise.resolve(existingTweet));
        const updatedTweet = {
          ...existingTweet,
          text: 'new Test',
        };
        jest
          .spyOn(mockTweetEntityRepository, 'save')
          .mockReturnValue(updatedTweet);
        const spyTweetRepository = jest.spyOn(
          mockTweetEntityRepository,
          'save',
        );
        const received = await service.update(updatedTweet);
        expect(spyTweetRepository).toBeCalledWith(updatedTweet);
        expect(received).toEqual(updatedTweet);
      });
    });
    describe('AND the provided tweet id is not valid', () => {
      it('THEN it should throw a Not Found Exception error', async () => {
        const tweet = TweetFactory.build();
        const notFoundExceptionError = new NotFoundException(
          'No tweet has been found with the given id',
        );
        jest
          .spyOn(service, 'getTweetById')
          .mockRejectedValue(notFoundExceptionError);
        await expect(service.update(tweet)).rejects.toThrowError(
          notFoundExceptionError,
        );
      });
    });
  });

  describe('WHEN data is provided to retrieve a tweet', () => {
    describe('AND the given tweet id is valid', () => {
      it('THEN it should retrieve the respective tweet', async () => {
        const existingTweet = TweetFactory.build();
        jest
          .spyOn(mockTweetEntityRepository, 'findOneBy')
          .mockReturnValue(existingTweet);
        const received = await service.getTweetById('1');
        expect(received).toEqual(existingTweet);
      });
    });
    describe('AND the tweet id is not valid', () => {
      it('THEN it should throw a Not Found Exception error', async () => {
        const notFoundExceptionError = new NotFoundException(
          'No tweet has been found with the given id',
        );
        jest.spyOn(mockTweetEntityRepository, 'findOneBy').mockImplementation();
        await expect(service.getTweetById('123')).rejects.toThrowError(
          notFoundExceptionError,
        );
      });
    });
  });

  describe('WHEN data is provided to delete a tweet', () => {
    describe('AND the given tweet id is valid', () => {
      it('THEN it should delete the respective tweet', async () => {
        const existingTweet = TweetFactory.build();
        jest
          .spyOn(service, 'getTweetById')
          .mockReturnValue(Promise.resolve(existingTweet));
        const spyTweetRepository = jest.spyOn(
          mockTweetEntityRepository,
          'delete',
        );
        await service.delete(existingTweet.id);
        expect(spyTweetRepository).toBeCalledWith(existingTweet.id);
      });
    });
    describe('AND the given tweet id is not valid', () => {
      it('THEN it should throw a Not Found Exception error', async () => {
        const tweet = TweetFactory.build();
        const notFoundExceptionError = new NotFoundException(
          'No tweet has been found with the given id',
        );
        jest
          .spyOn(service, 'getTweetById')
          .mockRejectedValue(notFoundExceptionError);
        await expect(service.update(tweet)).rejects.toThrowError(
          notFoundExceptionError,
        );
      });
    });
  });
});
