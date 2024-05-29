import { Bill, bill_types } from '@prisma/client';
import { Dayjs } from 'dayjs';
import { UserFromJwt } from 'src/auth/models/UserFromJwt';
import {
  BillDto,
  CreateBillDto,
  FilterBill,
  UpdateBillDto,
} from 'src/bill/dto/bill.dto';

export abstract class BillRepository {
  abstract createBill(dto: CreateBillDto, user: UserFromJwt): Promise<Bill>;
  abstract getBills(filters: FilterBill, user: UserFromJwt): Promise<BillDto[]>;
  abstract getAllBills(): Promise<Bill[]>;
  abstract getBillsDueTomorrow(date: Dayjs): Promise<Bill[]>;
  abstract getBillsDueToday(date: Dayjs): Promise<Bill[]>;
  abstract getOneBill(id: number, user: UserFromJwt): Promise<BillDto>;
  abstract updateBill(
    id: number,
    dto: UpdateBillDto,
    user: UserFromJwt,
  ): Promise<Bill>;
  abstract deleteBill(id: number, user: UserFromJwt): Promise<void>;
  abstract updateBillStatus(
    id: number,
    status: bill_types,
    now: Dayjs,
  ): Promise<void>;
  abstract updateBillNotify(
    id: number,
    email: string,
    type: string,
    now: Dayjs,
  ): Promise<void>;
}
