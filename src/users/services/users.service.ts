import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import UserEntity from '../../commons/persistence/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dtos/create-user.dto';
import * as argon2 from 'argon2';
import { UpdateUserDto } from '../dtos/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async getUserById(userId: string): Promise<UserEntity | null> {
    return await this.userRepository.findOneBy({ id: userId });
  }

  async getUserByUsername(username: string): Promise<UserEntity | null> {
    return await this.userRepository.findOneBy({ username });
  }

  async create(dto: CreateUserDto): Promise<UserEntity> {
    try {
      const hash = await argon2.hash(dto.password);
      const newUser = new UserEntity();
      newUser.username = dto.username;
      newUser.hash = hash;
      const existingUser = await this.getUserByUsername(dto.username);

      if (existingUser) {
        throw new ConflictException('This username is already in use');
      }
      return await this.userRepository.save(newUser);
    } catch (err: any) {
      const message = 'Something went wrong wile trying to create a user';
      if (err instanceof ConflictException) {
        throw new ConflictException(err.message);
      }
      throw new InternalServerErrorException(message);
    }
  }

  async update(dto: UpdateUserDto) {
    try {
      const { id, username, hash, hashedRT } = dto;
      const existingUser = await this.getUserById(id);
      if (!existingUser) {
        throw new NotFoundException('No user has been found with the given id');
      }
      const updatedUser = {
        ...existingUser,
        username: username ?? existingUser.username,
        hash: hash ?? existingUser.hash,
        hashedRT: hashedRT,
      };
      await this.userRepository.save(updatedUser);
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new NotFoundException(err.message);
      }
      throw new InternalServerErrorException(
        'Something went wrong while updating the user',
      );
    }
  }
}
