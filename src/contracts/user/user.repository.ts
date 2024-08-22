import { CodeVerification, Prisma, User } from '@prisma/client';
import { UserWithCodeVerification } from 'src/repositories/prisma/user/prisma-user.repository';
import { UserInfos, CreateUserDto, UpdateUserDto } from 'src/user/dto/user.dto';

export abstract class UserRepository {
  abstract createUser(dto: CreateUserDto): Promise<User>;

  abstract findUserByEmail(email: string): Promise<User>;

  abstract findOneUser(id: number): Promise<UserInfos>;

  abstract updateUser(dto: UpdateUserDto, id: number): Promise<User>;

  abstract deleteUser(id: number): Promise<void>;

  abstract validateAccount(user: User): Promise<CodeVerification | null>;

  abstract findCodeVerification(user_id: number): Promise<CodeVerification>;

  abstract createCodeVerification(
    user_id: number,
    now: Date,
    prismaTx: Prisma.TransactionClient,
  ): Promise<CodeVerification>;

  abstract findUserByCode(code: string): Promise<UserWithCodeVerification>;

  abstract invalidateCodeVerification(
    user_id: number,
    code_id: number,
    prismaTx: Prisma.TransactionClient,
  ): Promise<void>;

  abstract handleCodeVerification(
    user: User,
    codeVerification: CodeVerification,
    now: Date,
  ): Promise<CodeVerification>;
}
