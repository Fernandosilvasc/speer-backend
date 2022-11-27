import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import TweetEntity from '../../commons/persistence/tweet.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../../users/services/users.service';
import * as _ from 'lodash';
import { UpdateTweetDto } from '../dtos/update-tweet.dto';

@Injectable()
export class TweetsService {
  constructor(
    @InjectRepository(TweetEntity)
    private readonly tweetRepository: Repository<TweetEntity>,
    private readonly usersService: UsersService,
  ) {}

  async create(userId: string, text: string): Promise<Partial<TweetEntity>> {
    try {
      const user = await this.usersService.getUserById(userId);
      if (!user) {
        throw new NotFoundException('No user has been found with the given id');
      }
      const tweet = new TweetEntity();
      tweet.authorId = user.id;
      tweet.text = text;

      const createdTweet = await this.tweetRepository.save(tweet);
      return createdTweet;
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new NotFoundException(err.message);
      }
      throw new InternalServerErrorException(
        'Something went wrong while creating a tweet',
      );
    }
  }
  async getTweetById(tweetId: string): Promise<TweetEntity> {
    try {
      const tweet = await this.tweetRepository.findOneBy({ id: tweetId });
      if (!tweet) {
        throw new NotFoundException(
          'No tweet has been found with the given id',
        );
      }
      return tweet;
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new NotFoundException(err.message);
      }
      throw new InternalServerErrorException(
        'Something went wrong while retrieving a tweet',
      );
    }
  }
  async update(dto: UpdateTweetDto): Promise<TweetEntity> {
    try {
      const tweet = await this.getTweetById(dto.id);
      if (!tweet) {
        throw new NotFoundException(
          'No tweet has been found with the given id',
        );
      }
      tweet.text = dto.text ?? tweet.text;
      return await this.tweetRepository.save(tweet);
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new NotFoundException(err.message);
      }
      throw new InternalServerErrorException(
        'Something went wrong while updating a tweet',
      );
    }
  }
  async delete(tweetId: string): Promise<void> {
    try {
      const existingTweet = await this.getTweetById(tweetId);
      if (!existingTweet) {
        throw new NotFoundException(
          'No tweet has been found with the given id',
        );
      }
      this.tweetRepository.delete(tweetId);
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new NotFoundException(err.message);
      }
      throw new InternalServerErrorException(
        'Something went wrong while deleting a tweet',
      );
    }
  }
}
