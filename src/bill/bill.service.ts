import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaBillRepository } from 'src/repositories/prisma/bill/prisma-bill.repository';
import {
  BillDto,
  CreateBillDto,
  FilterBill,
  UpdateBillDto,
} from './dto/bill.dto';
import { UserFromJwt } from 'src/auth/models/UserFromJwt';
import { RecordWithId } from 'src/common/record-with-id.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Bill, Prisma } from '@prisma/client';
import { Dayjs } from 'dayjs';
const dayjs = require('dayjs'); //BRUH, por que não funciona sem importar assim?
import { bill_locker } from 'src/common/advisory-lock';
import { FilterDataCountPanel } from 'src/dashboard/dto/dashboard.dto';
import { SendMailService } from 'src/mailer/send.mail.service';

@Injectable()
export class BillService {
  constructor(
    private readonly billRepository: PrismaBillRepository,
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
    private readonly mailerService: SendMailService,
  ) {}

  async createBill(
    dto: CreateBillDto,
    user: UserFromJwt,
  ): Promise<RecordWithId> {
    if (dayjs(dto.due_date).isBefore(dayjs())) {
      throw new BadRequestException('Due date must be in the future');
    }

    const bill = await this.billRepository.createBill(dto, user);

    return {
      id: bill.id,
    };
  }

  async getBills(filters: FilterBill, user: UserFromJwt): Promise<BillDto[]> {
    return await this.billRepository.getBills(filters, user);
  }

  async getOneBill(id: number, user: UserFromJwt): Promise<BillDto> {
    const bill = await this.billRepository.getOneBill(id, user);

    if (!bill) throw new NotFoundException('Bill not found');

    return bill;
  }

  async updateBill(
    id: number,
    dto: UpdateBillDto,
    user: UserFromJwt,
  ): Promise<RecordWithId> {
    if (dto.due_date && dayjs(dto.due_date).isBefore(dayjs())) {
      throw new BadRequestException('Due date must be in the future');
    }

    const bill = await this.billRepository.getOneBill(id, user);

    if (!bill) throw new NotFoundException('Bill not found');

    const updatedBill = await this.billRepository.updateBill(id, dto, user);

    return {
      id: updatedBill.id,
    };
  }

  async deleteBill(id: number, user: UserFromJwt): Promise<void> {
    const bill = await this.billRepository.getOneBill(id, user);

    if (!bill) throw new NotFoundException('Bill not found or already deleted');

    return await this.billRepository.deleteBill(id, user);
  }

  @Cron(CronExpression.EVERY_DAY_AT_1PM)
  async handleBill() {
    const now = dayjs();

    await this.prisma.$transaction(
      async (prismaTx: Prisma.TransactionClient) => {
        const locked: { locked: boolean }[] =
          await prismaTx.$queryRaw`SELECT pg_try_advisory_lock(${bill_locker}) as locked;`;

        if (!locked[0].locked) return;

        try {
          const [billsDueTomorrow, billsDueToday] = await Promise.all([
            this.billRepository.getBillsDueTomorrow({
              date: now,
              prismaTx,
            }),
            this.billRepository.getBillsDueToday({
              date: now,
              prismaTx,
            }),
          ]);

          if (billsDueTomorrow.length === 0 && billsDueToday.length === 0)
            return;

          const billsOfTommorow = billsDueTomorrow.map((bill) =>
            this.handleTomorrowBills(bill, now, prismaTx),
          );

          const billsOfToday = billsDueToday.map((bill) =>
            this.handleTodayBills(bill, now, prismaTx),
          );

          await Promise.all([...billsOfTommorow, ...billsOfToday]);
        } finally {
          await prismaTx.$queryRaw`SELECT pg_advisory_unlock(${bill_locker});`;
        }
      },
      {
        maxWait: 15000,
        timeout: 60 * 1000,
        isolationLevel: 'ReadCommitted',
      },
    );
  }

  private async handleTomorrowBills(
    bill: Bill,
    now: Dayjs,
    prismaTx: Prisma.TransactionClient,
  ) {
    if (!bill.already_notify_1_day) {
      const user = await this.userService.findOneUser(bill.user_id);

      await Promise.all([
        this.billRepository.updateBillNotify({
          id: bill.id,
          type: '1-day',
          now,
          prismaTx,
        }),
        this.mailerService.sendEmailBillDueTomorrow({
          email: user.email,
          bill,
        }),
      ]);
    }
  }

  private async handleTodayBills(
    bill: Bill,
    now: Dayjs,
    prismaTx: Prisma.TransactionClient,
  ) {
    if (!bill.already_notify_due_date) {
      const user = await this.userService.findOneUser(bill.user_id);

      await Promise.all([
        this.billRepository.updateBillStatus({
          id: bill.id,
          status: 'overdue',
          now,
          prismaTx,
        }),
        this.billRepository.updateBillNotify({
          id: bill.id,
          type: 'due_date',
          now,
          prismaTx,
        }),
        this.mailerService.sendEmailBillDueToday({
          email: user.email,
          bill,
        }),
      ]);
    }
  }

  async countBills(
    filters: FilterDataCountPanel,
    user: UserFromJwt,
  ): Promise<number> {
    return await this.billRepository.countBills(filters, user);
  }

  async countBillsAlreadyPaid(
    filters: FilterDataCountPanel,
    user: UserFromJwt,
  ): Promise<number> {
    return await this.billRepository.countBillsAlreadyPaid(filters, user);
  }

  async countBillsToPay(
    filters: FilterDataCountPanel,
    user: UserFromJwt,
  ): Promise<number> {
    return await this.billRepository.countBillsToPay(filters, user);
  }
}
