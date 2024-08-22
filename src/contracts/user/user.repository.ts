import { CodeVerification, User } from '@prisma/client';
import { UserInfos, CreateUserDto, UpdateUserDto } from 'src/user/dto/user.dto';

export abstract class UserRepository {
  abstract createUser(dto: CreateUserDto): Promise<User>;
  abstract findUserByEmail(email: string): Promise<User>;
  abstract findOneUser(id: number): Promise<UserInfos>;
  abstract updateUser(dto: UpdateUserDto, id: number): Promise<User>;
  abstract deleteUser(id: number): Promise<void>;
  abstract validateAccount(user: User): Promise<void>;
  abstract findCodeVerification(user_id: number): Promise<CodeVerification>;
  abstract createCodeVerification(
    user_id: number,
    now: Date,
  ): Promise<CodeVerification>;
}
