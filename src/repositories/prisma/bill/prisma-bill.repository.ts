import { Injectable } from '@nestjs/common';
import { Bill, bill_types } from '@prisma/client';
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

  async updateBillStatus(id: number, status: bill_types): Promise<void> {
    await this.prisma.bill.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
    return;
  }

  async updateBillNotify(id: number, email: string): Promise<void> {
    await this.prisma.bill.update({
      where: {
        id,
        user: {
          email,
        },
      },
      data: {
        already_notify: true,
      },
    });
  }
}
