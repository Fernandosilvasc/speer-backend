import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { GetCurrentUserId } from 'src/commons/decorators';
import TweetEntity from 'src/commons/persistence/tweet.entity';
import { UpdateTweetDto } from '../dtos/update-tweet.dto';
import { TweetsService } from '../services/tweets.service';

@Controller('tweets')
export class TweetsController {
  constructor(private tweetsService: TweetsService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  createTweet(
    @GetCurrentUserId() userId: string,
    @Body() dto: any,
  ): Promise<Partial<TweetEntity>> {
    return this.tweetsService.create(userId, dto.text);
  }

  @Get(':id')
  @HttpCode(HttpStatus.FOUND)
  getTweetById(@Param('id') id: string): Promise<TweetEntity> {
    return this.tweetsService.getTweetById(id);
  }

  @Put('update')
  @HttpCode(HttpStatus.OK)
  updateTweet(@Body() dto: UpdateTweetDto): Promise<TweetEntity> {
    return this.tweetsService.update(dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  deleteTweetById(@Param('id') id: string): Promise<void> {
    return this.tweetsService.delete(id);
  }
}
