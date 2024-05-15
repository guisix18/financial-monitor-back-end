import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { UserPayload } from './models/UserPayload';
import { IUser } from './interface/user.interface';
import { JwtService } from '@nestjs/jwt';
import { UserToken } from './models/UserToken';
import { NOT_ACTIVE, LOGIN_ERROR } from './utils/auth.messages';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  login(user: IUser): UserToken {
    const payload: UserPayload = {
      id: user.id,
      sub: user.id,
      email: user.email,
      name: user.name,
      is_active: user.is_active,
    };

    return {
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '1d',
      }),
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findUserByEmail(email);

    if (!user) throw new BadRequestException(LOGIN_ERROR);

    if (!user.is_active) throw new BadRequestException(NOT_ACTIVE);

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      return {
        ...user,
        password: undefined,
      };
    }

    throw new BadRequestException(LOGIN_ERROR);
  }
}
