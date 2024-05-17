import { Transaction } from '@prisma/client';
import { UserFromJwt } from 'src/auth/models/UserFromJwt';
import {
  CreateTransactionDto,
  FilterTransaction,
  TransactionDto,
  UpdateTransactionDto,
} from 'src/transaction/dto/transaction.dto';

export abstract class TransactionRepository {
  abstract createTransaction(
    dto: CreateTransactionDto,
    user: UserFromJwt,
  ): Promise<Transaction>;

  abstract findManyTransactions(
    filters: FilterTransaction,
    user: UserFromJwt,
  ): Promise<TransactionDto[]>;

  abstract updateTransaction(
    id: number,
    dto: UpdateTransactionDto,
    user: UserFromJwt,
  ): Promise<Transaction>;

  abstract deleteTransaction(id: number, user: UserFromJwt): Promise<void>;
}
