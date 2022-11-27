import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateTweetDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  text: string;
}
