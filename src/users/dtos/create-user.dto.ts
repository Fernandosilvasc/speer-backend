import { IsNotEmpty, Matches } from 'class-validator';
import { RegexHelper } from 'src/commons/helpers/regex.helper';

export class CreateUserDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  @Matches(RegexHelper.password)
  password: string;
}
