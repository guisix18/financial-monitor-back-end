import { Bill, bill_types } from '@prisma/client';
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
  abstract getOneBill(id: number, user: UserFromJwt): Promise<BillDto>;
  abstract updateBill(
    id: number,
    dto: UpdateBillDto,
    user: UserFromJwt,
  ): Promise<Bill>;
  abstract deleteBill(id: number, user: UserFromJwt): Promise<void>;
  abstract updateBillStatus(id: number, status: bill_types): Promise<void>;
}
