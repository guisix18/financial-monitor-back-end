import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRepository } from '../user/user.repository';
import { UserItem, CreateUserDto, UpdateUserDto } from 'src/user/dto/user.dto';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    const exists = await this.prisma.user.count({
      where: {
        email: dto.email,
      },
    });

    if (exists > 0) {
      throw new BadRequestException('Already exists an user with this email');
    }

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: bcrypt.hashSync(dto.password, 8),
      },
    });

    return user;
  }

  async findUserByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });

    return user;
  }

  async findOneUser(id: number): Promise<UserItem> {
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
            description: true,
            category: true,
            made_in: true,
            value: true,
            type: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async updateUser(dto: UpdateUserDto, id: number): Promise<User> {
    const user = await this.prisma.user.count({
      where: {
        id,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const updatedUser = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        name: dto.name,
        email: dto.email,
        password: dto.password,
      },
    });

    return updatedUser;
  }
}
