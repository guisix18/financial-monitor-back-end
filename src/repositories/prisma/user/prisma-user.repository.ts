import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UserRepository } from '../../../contracts/user/user.repository';
import {
  UserInfos,
  CreateUserDto,
  UpdateUserDto,
} from '../../../user/dto/user.dto';
import { CodeVerification, Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    const now = new Date();

    const user = await this.prisma.$transaction(
      async (prismaTx: Prisma.TransactionClient) => {
        const user = await prismaTx.user.create({
          data: {
            name: dto.name,
            email: dto.email,
            password: bcrypt.hashSync(dto.password, 8),
            created_at: now,
          },
        });

        //test.setHours(test.getHours() + 1)

        await prismaTx.codeVerification.create({
          data: {
            code: randomUUID(),
            created_at: now,
            expire_date: new Date(now.setHours(now.getHours() + 1)),
            user_id: user.id,
          },
        });

        return user;
      },
    );

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
            made_in: true,
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

  async findCodeVerification(user_id: number): Promise<CodeVerification> {
    const codeVerification = await this.prisma.codeVerification.findUnique({
      where: {
        user_id,
      },
    });

    return codeVerification;
  }

  async createCodeVerification(
    user_id: number,
    now: Date,
  ): Promise<CodeVerification> {
    const codeVerification = await this.prisma.codeVerification.create({
      data: {
        code: randomUUID(),
        created_at: now,
        expire_date: new Date(now.setHours(now.getHours() + 1)),
        user_id,
      },
    });

    return codeVerification;
  }
}
