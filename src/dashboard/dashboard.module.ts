import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TransactionModule } from 'src/transaction/transaction.module';
import { BillModule } from 'src/bill/bill.module';

@Module({
  imports: [TransactionModule, BillModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
