import { Injectable } from '@nestjs/common';
import { PrismaUserRepository } from 'src/repositories/prisma/prisma-user.repository';
import { UserItem, CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { RecordWithId } from 'src/common/record-with-id.dto';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: PrismaUserRepository) {}

  async createUser(dto: CreateUserDto): Promise<RecordWithId> {
    const user = await this.userRepository.createUser(dto);

    return {
      id: user.id,
    };
  }

  async findUserByEmail(email: string): Promise<User> {
    return await this.userRepository.findUserByEmail(email);
  }

  async findOneUser(id: number): Promise<UserItem> {
    return await this.userRepository.findOneUser(id);
  }

  async updateUser(dto: UpdateUserDto, id: number): Promise<RecordWithId> {
    const updatedUser = await this.userRepository.updateUser(dto, id);

    return {
      id: updatedUser.id,
    };
  }
}
