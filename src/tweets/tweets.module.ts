import { Module } from '@nestjs/common';
import { TweetsService } from './services/tweets.service';
import { TweetsController } from './controllers/tweets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import TweetEntity from '../commons/persistence/tweet.entity';
import { UsersService } from '../users/services/users.service';
import UserEntity from '../commons/persistence/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TweetEntity, UserEntity])],
  providers: [TweetsService, UsersService],
  controllers: [TweetsController],
})
export class TweetsModule {}
