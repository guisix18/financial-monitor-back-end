import { User } from '@prisma/client';
import { UserItem, CreateUserDto, UpdateUserDto } from 'src/user/dto/user.dto';

export abstract class UserRepository {
  abstract createUser(dto: CreateUserDto): Promise<User>;
  abstract findUserByEmail(email: string): Promise<User>;
  abstract findOneUser(id: number): Promise<UserItem>;
  abstract updateUser(dto: UpdateUserDto, id: number): Promise<User>;
}
