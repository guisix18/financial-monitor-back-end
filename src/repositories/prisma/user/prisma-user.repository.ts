import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UserRepository } from '../../../contracts/user/user.repository';
import {
  UserInfos,
  CreateUserDto,
  UpdateUserDto,
} from '../../../user/dto/user.dto';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: bcrypt.hashSync(dto.password, 8),
      },
    });

    return user;
  }

  async validateAccount(user: User): Promise<void> {
    if (user.is_active) {
      throw new BadRequestException('User already validated');
    }

    const now = new Date();

    await this.prisma.$transaction(
      async (prismaTx: Prisma.TransactionClient) => {
        await prismaTx.user.update({
          where: {
            id: user.id,
            is_active: false,
          },
          data: {
            is_active: true,
            updated_at: now,
          },
        });
      },
    );

    return;
  }

  async findUserByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });

    return user;
  }

  async findOneUser(id: number): Promise<UserInfos> {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        name: true,
        email: true,
        password: false,
        bill: {
          select: {
            description: true,
            amount: true,
            due_date: true,
            status: true,
          },
        },
        transaction: {
          select: {
            id: true,
            description: true,
            category: true,
            created_at: true,
            value: true,
            type: true,
          },
        },
      },
    });

    return user;
  }

  async updateUser(dto: UpdateUserDto, id: number): Promise<User> {
    const updatedUser = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        name: dto.name,
        email: dto.email,
        password: bcrypt.hashSync(dto.password, 8),
      },
    });

    return updatedUser;
  }

  async deleteUser(id: number): Promise<void> {
    await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        deleted_at: new Date(),
        is_active: false,
      },
    });

    return;
  }

  async findUserComplete(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    return user;
  }
}
