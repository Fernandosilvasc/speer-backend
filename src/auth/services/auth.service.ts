import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../../commons/config/config.service';
import { AuthDto } from '../dtos/auth.dto';
import { JwtPayload, Tokens } from '../types';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signupLocal(dto: AuthDto) {
    try {
      const user = await this.usersService.create(dto);
      console.log('user=>', user);
      const tokens = await this.getTokens(user.id, user.username);
      const result = await this.updateRtHash(user.id, tokens.refresh_token);
      console.log('result', result);

      return tokens;
    } catch (err) {
      if (err instanceof ConflictException) {
        throw new ConflictException(err.message);
      }
      console.log(err);
      const message = `Something went wrong when signing up`;
      throw new InternalServerErrorException(message);
    }
  }

  async signinLocal(dto: AuthDto): Promise<Tokens> {
    const user = await this.usersService.getUserByUsername(dto.username);

    if (!user) throw new ForbiddenException('Access Denied');

    const passwordMatches = await argon2.verify(user.hash, dto.password);
    if (!passwordMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.username);
    await this.updateRtHash(user.id, tokens.refresh_token);

    return tokens;
  }

  async logout(userId: string): Promise<boolean> {
    await this.usersService.update({ id: userId, hashedRT: null });
    return true;
  }

  async getTokens(userId: string, username: string): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      sub: userId,
      username: username,
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get('jwt.at_secret'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get('jwt.rt_secret'),
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  async refreshTokens(userId: string, rt: string): Promise<Tokens> {
    const user = await this.usersService.getUserById(userId);
    if (!user || !user.hashedRT) throw new ForbiddenException('Access Denied');

    const rtMatches = await argon2.verify(user.hashedRT, rt);
    if (!rtMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.username);
    await this.updateRtHash(user.id, tokens.refresh_token);

    return tokens;
  }

  async updateRtHash(userId: string, rt: string): Promise<void> {
    const hashedRT = await argon2.hash(rt);
    await this.usersService.update({ id: userId, hashedRT });
  }
}
