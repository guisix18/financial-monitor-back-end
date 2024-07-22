import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaTransactionRepository } from 'src/repositories/prisma/transaction/prisma-transaction.repository';
import { TransactionRepository } from 'src/contracts/transaction/transaction.repository';

@Module({
  imports: [PrismaModule],
  controllers: [TransactionController],
  providers: [
    TransactionService,
    PrismaTransactionRepository,
    {
      provide: TransactionRepository,
      useClass: PrismaTransactionRepository,
    },
  ],
})
export class TransactionModule {}
