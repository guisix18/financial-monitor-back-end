import { Inject, Injectable, NotFoundException } from '@nestjs/common';
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
import { MailerService } from '@nestjs-modules/mailer';
import { UserService } from 'src/user/user.service';
import * as dayjs from 'dayjs';

@Injectable()
export class BillService {
  constructor(
    private readonly billRepository: PrismaBillRepository,
    private readonly userService: UserService,
    @Inject(MailerService) private readonly mailer: MailerService,
  ) {}

  async createBill(
    dto: CreateBillDto,
    user: UserFromJwt,
  ): Promise<RecordWithId> {
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

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleBill() {
    const now = dayjs();
    console.log('NOW', now);
    const tomorrow = now.add(1, 'day');
    console.log('tomorrow =>', tomorrow);

    const billsDueTomorrow = await this.billRepository.getBillsDueTomorrow(
      tomorrow,
    );
    const billsDueToday = await this.billRepository.getBillsDueToday(now);

    if (billsDueTomorrow.length < 1 && billsDueToday.length < 1) return;

    for (const bill of billsDueTomorrow) {
      const user = await this.userService.findOneUser(bill.user_id);

      if (!bill.already_notify_1_day) {
        await Promise.all([
          this.billRepository.updateBillNotify(
            bill.id,
            user.email,
            '1-day',
            now,
          ),
          await this.mailer.sendMail({
            to: user.email,
            from: 'guisix16@gmail.com',
            subject: `Sua fatura está prestes a vencer!`,
            html: `<h1>Sua conta "${bill.description}" vence amanhã (${dayjs(
              bill.due_date,
            ).format('DD/MM/YYYY')}).</h1>`,
          }),
        ]);
      }
    }

    for (const bill of billsDueToday) {
      const user = await this.userService.findOneUser(bill.user_id);

      if (!bill.already_notify_due_date) {
        await Promise.all([
          this.billRepository.updateBillStatus(bill.id, 'overdue', now),
          this.billRepository.updateBillNotify(
            bill.id,
            user.email,
            'due_date',
            now,
          ),
          this.mailer.sendMail({
            to: user.email,
            from: 'guisix16@gmail.com',
            subject: `Sua fatura está vencida!`,
            html: `<h1>Sua conta "${bill.description}" vence hoje (${dayjs(
              bill.due_date,
            ).format('DD/MM/YYYY')}).</h1>`,
          }),
        ]);
      }
    }
  }
}
