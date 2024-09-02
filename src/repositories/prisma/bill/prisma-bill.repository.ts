import { BadRequestException, Injectable } from '@nestjs/common';
import { Bill } from '@prisma/client';
import { UserFromJwt } from 'src/auth/models/UserFromJwt';
import {
  BillDto,
  CreateBillDto,
  FilterBill,
  FilterBillInterval,
  UpdateBillDto,
  UpdateBillNotifyParams,
  UpdateBillStatus,
} from 'src/bill/dto/bill.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { BillRepository } from 'src/contracts/bill/bill.repository';
import { FilterDataCountPanel } from 'src/dashboard/dto/dashboard.dto';

type NotifyTypeMapping = {
  '1-day': 'already_notify_1_day';
  due_date: 'already_notify_due_date';
};

@Injectable()
export class PrismaBillRepository implements BillRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createBill(dto: CreateBillDto, user: UserFromJwt): Promise<Bill> {
    const bill = await this.prisma.bill.create({
      data: {
        amount: dto.amount,
        description: dto.description,
        due_date: dto.due_date,
        user_id: user.id,
      },
    });

    return bill;
  }

  async getBills(filters: FilterBill, user: UserFromJwt): Promise<BillDto[]> {
    const bills = await this.prisma.bill.findMany({
      where: {
        user_id: user.id,
        created_at: {
          gte: filters.start_date,
          lte: filters.end_date,
        },
        status: filters.status,
      },
      select: {
        id: true,
        description: true,
        amount: true,
        due_date: true,
        status: true,
        created_at: true,
      },
    });

    return bills;
  }

  async getAllBills(): Promise<Bill[]> {
    const bills = await this.prisma.bill.findMany({});

    return bills;
  }

  async getBillsDueTomorrow(params: FilterBillInterval): Promise<Bill[]> {
    const { date, prismaTx } = params;

    const startOfTomorrow = date.add(1, 'day').startOf('day');
    const endOfTomorrow = date.add(1, 'day').endOf('day');

    const bills = await prismaTx.bill.findMany({
      where: {
        due_date: {
          gte: startOfTomorrow.toDate(),
          lte: endOfTomorrow.toDate(),
        },
        status: 'pending',
        already_notify_1_day: false,
        deleted_at: null,
      },
    });

    return bills;
  }

  async getBillsDueToday(params: FilterBillInterval): Promise<Bill[]> {
    const { date, prismaTx } = params;

    const bills = await prismaTx.bill.findMany({
      where: {
        due_date: {
          lte: date.toDate(),
        },
        status: 'pending',
        already_notify_due_date: false,
        deleted_at: null,
      },
    });

    return bills;
  }

  async getOneBill(id: number, user: UserFromJwt): Promise<BillDto> {
    const bill = await this.prisma.bill.findUnique({
      where: {
        id,
        user_id: user.id,
      },
      select: {
        id: true,
        description: true,
        amount: true,
        due_date: true,
        status: true,
        created_at: true,
      },
    });

    return bill;
  }

  async updateBill(
    id: number,
    dto: UpdateBillDto,
    user: UserFromJwt,
  ): Promise<Bill> {
    const updatedBill = await this.prisma.bill.update({
      where: {
        id,
        user_id: user.id,
      },
      data: {
        amount: dto.amount,
        description: dto.description,
        due_date: dto.due_date,
        status: dto.status,
        updated_at: new Date(),
      },
    });

    return updatedBill;
  }

  async deleteBill(id: number, user: UserFromJwt): Promise<void> {
    await this.prisma.bill.update({
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

  async updateBillStatus(params: UpdateBillStatus): Promise<void> {
    const { id, status, now, prismaTx } = params;

    if (!id) throw new BadRequestException('Bill ID is required');

    await prismaTx.bill.update({
      where: {
        id,
      },
      data: {
        status,
        updated_at: now.toDate(),
      },
    });
    return;
  }

  async updateBillNotify(params: UpdateBillNotifyParams): Promise<void> {
    const { id, type, now, prismaTx } = params;

    if (!id) throw new BadRequestException('Bill ID is required');

    //Esse mapping é uma forma de garantir que o tipo de notificação é válido e talvez tenha outro tipo de notificação no futuro
    const notifyType: NotifyTypeMapping = {
      '1-day': 'already_notify_1_day',
      due_date: 'already_notify_due_date',
    };

    const notifyField = notifyType[type];

    if (notifyField) {
      await prismaTx.bill.update({
        where: {
          id,
          deleted_at: null,
        },
        data: {
          [notifyField]: true,
          updated_at: now.toDate(),
        },
      });

      return;
    }

    console.log('Invalid notify type');
  }

  async countBills(
    filters: FilterDataCountPanel,
    user: UserFromJwt,
  ): Promise<number> {
    const count = await this.prisma.bill.count({
      where: {
        user_id: user.id,
        created_at: {
          gte: filters.start_date,
          lte: filters.end_date,
        },
      },
    });

    return count;
  }

  async countBillsAlreadyPaid(
    filters: FilterDataCountPanel,
    user: UserFromJwt,
  ): Promise<number> {
    const count = await this.prisma.bill.count({
      where: {
        user_id: user.id,
        created_at: {
          gte: filters.start_date,
          lte: filters.end_date,
        },
        status: 'paid',
      },
    });

    return count;
  }

  async countBillsToPay(
    filters: FilterDataCountPanel,
    user: UserFromJwt,
  ): Promise<number> {
    const count = await this.prisma.bill.count({
      where: {
        user_id: user.id,
        created_at: {
          gte: filters.start_date,
          lte: filters.end_date,
        },
        status: 'pending',
      },
    });

    return count;
  }
}
