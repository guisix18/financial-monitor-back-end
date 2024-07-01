import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaUserRepository } from '../../src/repositories/prisma//user/prisma-user.repository';
import { UserInfos, CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { RecordWithId } from '../../src/common/record-with-id.dto';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: PrismaUserRepository) {}

  async createUser(dto: CreateUserDto): Promise<RecordWithId> {
    const user = await this.userRepository.findUserByEmail(dto.email);

    if (user) {
      throw new BadRequestException('Already exists an user with this email');
    }

    const createdUser = await this.userRepository.createUser(dto);

    return {
      id: createdUser.id,
    };
  }

  async findUserByEmail(email: string): Promise<User> {
    return await this.userRepository.findUserByEmail(email);
  }

  async findOneUser(id: number): Promise<UserInfos> {
    const user = await this.userRepository.findOneUser(id);

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async updateUser(dto: UpdateUserDto, id: number): Promise<RecordWithId> {
    const user = await this.findOneUser(id);

    if (!user) throw new NotFoundException('User not found');

    const updatedUser = await this.userRepository.updateUser(dto, id);

    return {
      id: updatedUser.id,
    };
  }

  async deleteUser(id: number): Promise<void> {
    return await this.userRepository.deleteUser(id);
  }
}
