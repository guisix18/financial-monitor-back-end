import { Injectable } from '@nestjs/common';
import { PrismaTransactionRepository } from 'src/repositories/prisma/transaction/prisma-transaction.repository';
import {
  CreateTransactionDto,
  FilterTransaction,
  TransactionDto,
  UpdateTransactionDto,
} from './dto/transaction.dto';
import { UserFromJwt } from 'src/auth/models/UserFromJwt';
import { RecordWithId } from 'src/common/record-with-id.dto';

@Injectable()
export class TransactionService {
  constructor(
    private readonly transactionRepository: PrismaTransactionRepository,
  ) {}

  async createTransaction(
    dto: CreateTransactionDto,
    user: UserFromJwt,
  ): Promise<RecordWithId> {
    const transaction = await this.transactionRepository.createTransaction(
      dto,
      user,
    );

    return {
      id: transaction.id,
    };
  }

  async findManyTransactions(
    filters: FilterTransaction,
    user: UserFromJwt,
  ): Promise<TransactionDto[]> {
    return await this.transactionRepository.findManyTransactions(filters, user);
  }

  async updateTransaction(
    id: number,
    dto: UpdateTransactionDto,
    user: UserFromJwt,
  ): Promise<RecordWithId> {
    const updatedTransaction =
      await this.transactionRepository.updateTransaction(id, dto, user);

    return {
      id: updatedTransaction.id,
    };
  }

  async deleteTransaction(id: number, user: UserFromJwt): Promise<void> {
    return await this.transactionRepository.deleteTransaction(id, user);
  }
}
