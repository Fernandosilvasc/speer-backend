import { Module } from '@nestjs/common';
import { TweetsService } from './services/tweets.service';
import { TweetsController } from './controllers/tweets.controller';

@Module({
  providers: [TweetsService],
  controllers: [TweetsController],
})
export class TweetsModule {}
