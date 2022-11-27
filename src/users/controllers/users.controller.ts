import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { Public } from '../../commons/decorators';
import { UsersService } from '../services/users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }
}
