import { Injectable } from '@nestjs/common';
import { Bill, bill_types } from '@prisma/client';
import { Dayjs } from 'dayjs';
import { UserFromJwt } from 'src/auth/models/UserFromJwt';
import {
  BillDto,
  CreateBillDto,
  FilterBill,
  UpdateBillDto,
} from 'src/bill/dto/bill.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { BillRepository } from 'src/repositories/bill/bill.repository';

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

  async getBillsDueTomorrow(date: Dayjs): Promise<Bill[]> {
    const startOfTomorrow = date.add(1, 'day').startOf('day');
    const endOfTomorrow = date.add(1, 'day').endOf('day');

    const bills = await this.prisma.bill.findMany({
      where: {
        due_date: {
          gte: startOfTomorrow.toDate(),
          lte: endOfTomorrow.toDate(),
        },
        status: 'pending',
        already_notify_1_day: false,
      },
    });

    return bills;
  }

  async getBillsDueToday(date: Dayjs): Promise<Bill[]> {
    const bills = await this.prisma.bill.findMany({
      where: {
        due_date: {
          lte: date.toDate(),
        },
        status: 'pending',
        already_notify_due_date: false,
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

  async updateBillStatus(
    id: number,
    status: bill_types,
    now: Dayjs,
  ): Promise<void> {
    await this.prisma.bill.update({
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

  async updateBillNotify(
    id: number,
    email: string,
    type: string,
    now: Dayjs,
  ): Promise<void> {
    if (type === '1-day') {
      await this.prisma.bill.update({
        where: {
          id,
          user: {
            email,
          },
        },
        data: {
          already_notify_1_day: true,
          updated_at: now.toDate(),
        },
      });
    }

    if (type === 'due_date') {
      await this.prisma.bill.update({
        where: {
          id,
          user: {
            email,
          },
        },
        data: {
          already_notify_due_date: true,
          updated_at: now.toDate(),
        },
      });
    }
  }
}
