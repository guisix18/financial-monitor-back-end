import { BadRequestException, Injectable } from '@nestjs/common';
import { BillService } from 'src/bill/bill.service';
import { TransactionService } from 'src/transaction/transaction.service';
import {
  DataCountDto,
  DataCountPanels,
  DataCountResponseDto,
  FilterDataCountPanel,
} from './dto/dashboard.dto';
import { UserFromJwt } from 'src/auth/models/UserFromJwt';

@Injectable()
export class DashboardService {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly billService: BillService,
  ) {}

  async dataCount(
    filters: FilterDataCountPanel,
    user: UserFromJwt,
  ): Promise<DataCountResponseDto> {
    if (new Date(filters.start_date) > new Date(filters.end_date)) {
      throw new BadRequestException('Start date must be less than end date');
    }

    const typesToPromises: (DataCountPanels | undefined)[] = filters.panel
      ? filters.panel
      : ['transactions', 'bills', 'bills_already_paid', 'bills_to_pay'];

    const promises = typesToPromises.map((dataCountType) => {
      switch (dataCountType) {
        case 'transactions':
          return this.countTransactions(filters, user);
        case 'bills':
          return this.countBills(filters, user);
        case 'bills_already_paid':
          return this.countBillsAlreadyPaid(filters, user);
        case 'bills_to_pay':
          return this.countBillsToPay(filters, user);
        default:
          dataCountType satisfies never;
      }
    });

    const results = await Promise.all(promises);

    return {
      data: results,
    };
  }

  private async countTransactions(
    filters: FilterDataCountPanel,
    user: UserFromJwt,
  ): Promise<DataCountDto> {
    const count = await this.transactionService.countTransactions(
      filters,
      user,
    );

    return {
      type: 'transactions',
      count,
    };
  }

  private async countBills(
    filters: FilterDataCountPanel,
    user: UserFromJwt,
  ): Promise<DataCountDto> {
    const count = await this.billService.countBills(filters, user);

    return {
      type: 'bills',
      count,
    };
  }

  private async countBillsAlreadyPaid(
    filters: FilterDataCountPanel,
    user: UserFromJwt,
  ): Promise<DataCountDto> {
    const count = await this.billService.countBillsAlreadyPaid(filters, user);

    return {
      type: 'bills_already_paid',
      count,
    };
  }

  private async countBillsToPay(
    filters: FilterDataCountPanel,
    user: UserFromJwt,
  ): Promise<DataCountDto> {
    const count = await this.billService.countBillsToPay(filters, user);

    return {
      type: 'bills_to_pay',
      count,
    };
  }
}
