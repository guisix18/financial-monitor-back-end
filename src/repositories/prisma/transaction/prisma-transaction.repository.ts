import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Transaction, TransactionHistory } from '@prisma/client';
import { UserFromJwt } from 'src/auth/models/UserFromJwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransactionRepository } from 'src/contracts/transaction/transaction.repository';
import {
  CreateTransactionDto,
  FilterTransaction,
  TransactionDto,
  TransactionHistoryDto,
  UpdateTransactionDto,
  UpdateTransactionHistoryDto,
} from 'src/transaction/dto/transaction.dto';
import { TRANSACTION_HISTORY_NOT_FOUND } from 'src/transaction/utils/transactions.exceptions';
import { transaction_locker } from 'src/common/advisory-lock';

@Injectable()
export class PrismaTransactionRepository implements TransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createTransaction(
    dto: CreateTransactionDto,
    user: UserFromJwt,
  ): Promise<Transaction> {
    const now = new Date();

    const transaction: Transaction = await this.prisma.$transaction(
      async (prismaTx: Prisma.TransactionClient) => {
        const locked: { locked: boolean }[] =
          await prismaTx.$queryRaw`SELECT pg_try_advisory_lock(${transaction_locker}) as locked;`;

        if (!locked[0].locked) return;

        try {
          const transaction = await prismaTx.transaction.create({
            data: {
              created_at: now,
              description: dto.description,
              category: dto.category,
              type: dto.type,
              value: dto.value,
              user_id: user.id,
              made_in: dto.made_in,
            },
          });

          const transactionHistory: TransactionHistoryDto = {
            transferred_in: now,
            created_by: user.id,
            transaction_id: transaction.id,
            transaction_type: dto.type,
          };

          await Promise.all([
            this.upsertTransactionHistory(transactionHistory, prismaTx, now),
          ]);

          return transaction;
        } finally {
          await prismaTx.$executeRaw`SELECT pg_advisory_unlock(${transaction_locker});`;
        }
      },
      {
        maxWait: 15000,
        timeout: 60 * 1000,
        isolationLevel: 'Serializable',
      },
    );

    return transaction;
  }

  private async upsertTransactionHistory(
    data: TransactionHistoryDto | UpdateTransactionHistoryDto,
    prismaTx: Prisma.TransactionClient,
    now: Date,
    transaction_history_id?: number,
  ): Promise<TransactionHistory> {
    if (transaction_history_id) {
      return prismaTx.transactionHistory.update({
        where: {
          id: transaction_history_id,
          deleted_at: null,
        },
        data: {
          transferred_in: data.transferred_in,
          transaction_type: data.transaction_type,
          updated_at: now,
        },
      });
    }

    return prismaTx.transactionHistory.create({
      data: {
        transaction_type: data.transaction_type,
        transferred_in: data.transferred_in,
        created_by: data.created_by,
        transaction_id: data.transaction_id,
      },
    });
  }

  async findManyTransactions(
    filters: FilterTransaction,
    user: UserFromJwt,
  ): Promise<TransactionDto[]> {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        user_id: user.id,
        type: filters.type,
        created_at: {
          gte: filters.start_date,
          lte: filters.end_date,
        },
      },
      select: {
        id: true,
        category: true,
        description: true,
        type: true,
        value: true,
        created_at: true,
      },
    });

    return transactions;
  }

  async findOneTransaction(
    id: number,
    user: UserFromJwt,
  ): Promise<Transaction> {
    return this.prisma.transaction.findUnique({
      where: {
        id,
        user_id: user.id,
      },
    });
  }

  private async findOneTransactionHistory(
    transaction_id: number,
    user: UserFromJwt,
    prismaTx: Prisma.TransactionClient,
  ): Promise<TransactionHistory> {
    return prismaTx.transactionHistory.findFirst({
      where: {
        transaction_id,
        deleted_at: null,
        user: {
          id: user.id,
        },
      },
    });
  }

  async updateTransaction(
    id: number,
    dto: UpdateTransactionDto,
    user: UserFromJwt,
  ): Promise<Transaction> {
    const now = new Date();

    const updatedTransaction: Transaction = await this.prisma.$transaction(
      async (prismaTx: Prisma.TransactionClient) => {
        const transaction = await prismaTx.transaction.findUnique({
          where: {
            id,
            user_id: user.id,
          },
        });

        const transactionHistory = await this.findOneTransactionHistory(
          transaction.id,
          user,
          prismaTx,
        );

        if (!transactionHistory) {
          throw new NotFoundException(TRANSACTION_HISTORY_NOT_FOUND);
        }

        const updatedTransaction = await prismaTx.transaction.update({
          where: {
            id,
            user_id: user.id,
          },
          data: {
            description: dto.description,
            category: dto.category,
            type: dto.type,
            value: dto.value,
            updated_at: now,
          },
        });

        const dataToUpdate: UpdateTransactionHistoryDto = {
          transaction_type: updatedTransaction.type,
          transferred_in: updatedTransaction.created_at,
        };

        await this.upsertTransactionHistory(
          dataToUpdate,
          prismaTx,
          now,
          transactionHistory.id,
        );

        return updatedTransaction;
      },
      {
        isolationLevel: 'Serializable',
      },
    );

    return updatedTransaction;
  }

  async deleteTransaction(id: number, user: UserFromJwt): Promise<void> {
    await this.prisma.transaction.update({
      where: {
        id,
        user_id: user.id,
      },
      data: {
        deleted_at: new Date(),
      },
    });

    return;
  }
}
