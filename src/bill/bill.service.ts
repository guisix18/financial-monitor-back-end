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

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async handleBill() {
    const now = new Date();

    const bills = await this.billRepository.getAllBills();

    const filterBills = bills.filter((bill) => {
      return bill.status !== 'paid' && bill.due_date <= now;
    });

    if (filterBills.length < 1) return;

    for (const overdueBill of filterBills) {
      await this.billRepository.updateBillStatus(overdueBill.id, 'overdue');
    }

    for (const bill of filterBills) {
      const user = await this.userService.findOneUser(bill.user_id);

      if (!bill.already_notify) {
        await this.mailer.sendMail({
          to: user.email,
          from: 'guisix16@gmail.com',
          subject: `Sua fatura está vencida`,
          html: `<h1>Sua fatura com ID ${bill.id} e descrição ${bill.description} está vencida`,
        });

        await this.billRepository.updateBillNotify(bill.id, user.email);
      }
    }
  }
}
