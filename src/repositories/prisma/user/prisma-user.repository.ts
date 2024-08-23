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

export type UserWithCodeVerification = User & {
  codeVerification: CodeVerification[];
};

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

        const expire_date = new Date(now.getTime());
        expire_date.setHours(expire_date.getHours() + 1);

        await prismaTx.codeVerification.create({
          data: {
            code: randomUUID(),
            created_at: now,
            expire_date,
            user_id: user.id,
          },
        });

        return user;
      },
    );

    return user;
  }

  async validateAccount(
    user: UserWithCodeVerification,
  ): Promise<CodeVerification | null> {
    if (user.is_active) {
      throw new BadRequestException('User already validated');
    }

    const { codeVerification } = user;
    const now = new Date();

    const validCode = codeVerification.find(
      (code) => !code.already_used && !code.expired && now <= code.expire_date,
    );

    if (!validCode) {
      return await this.prisma.$transaction(
        async (prismaTx: Prisma.TransactionClient) => {
          await prismaTx.codeVerification.updateMany({
            where: {
              user_id: user.id,
            },
            data: {
              expired: true,
              expire_date: now,
            },
          });

          return this.createCodeVerification(user.id, now, prismaTx);
        },
      );
    }

    return await this.prisma.$transaction(
      async (prismaTx: Prisma.TransactionClient) => {
        await prismaTx.codeVerification.update({
          where: {
            id: validCode.id,
            code: validCode.code,
          },
          data: {
            already_used: true,
            used_at: now,
          },
        });

        await prismaTx.user.update({
          where: {
            id: user.id,
          },
          data: {
            is_active: true,
            updated_at: now,
          },
        });

        //Se caiu aqui, user tá validado não tem o que retornar.
        return null;
      },
    );
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

  async findUserByCode(code: string): Promise<UserWithCodeVerification> {
    const user = await this.prisma.user.findFirst({
      where: {
        codeVerification: {
          some: {
            code,
          },
        },
      },
      include: {
        codeVerification: true,
      },
    });

    return user;
  }

  async findCodeVerification(user_id: number): Promise<CodeVerification> {
    const codeVerification = await this.prisma.codeVerification.findFirst({
      where: {
        user_id,
        already_used: false,
        expired: false,
        used_at: null,
      },
    });

    return codeVerification;
  }

  async createCodeVerification(
    user_id: number,
    now: Date,
    prismaTx: Prisma.TransactionClient,
  ): Promise<CodeVerification> {
    const codeVerification = await prismaTx.codeVerification.create({
      data: {
        code: randomUUID(),
        created_at: now,
        expire_date: new Date(now.setHours(now.getHours() + 1)),
        user_id,
      },
    });

    return codeVerification;
  }

  async invalidateCodeVerification(
    user_id: number,
    code_id: number,
    prismaTx: Prisma.TransactionClient,
  ): Promise<void> {
    await prismaTx.codeVerification.update({
      where: {
        id: code_id,
        user_id,
      },
      data: {
        expired: true,
        expire_date: new Date(),
      },
    });

    return;
  }

  async handleCodeVerification(
    user: User,
    codeVerification: CodeVerification,
    now: Date,
  ): Promise<CodeVerification> {
    const code = await this.prisma.$transaction(
      async (prismaTx: Prisma.TransactionClient) => {
        await this.invalidateCodeVerification(
          user.id,
          codeVerification.id,
          prismaTx,
        );

        // Gerar um novo código de verificação
        const newCodeVerification = await this.createCodeVerification(
          user.id,
          now,
          prismaTx,
        );

        return newCodeVerification;
      },
    );

    return code;
  }
}
