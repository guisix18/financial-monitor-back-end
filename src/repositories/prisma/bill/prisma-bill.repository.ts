import { Injectable } from '@nestjs/common';
import { Bill } from '@prisma/client';
import { UserFromJwt } from 'src/auth/models/UserFromJwt';
import { CreateBillDto } from 'src/bill/dto/bill.dto';
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
}
