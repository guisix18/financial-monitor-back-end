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

export abstract class BillRepository {
  abstract createBill(dto: CreateBillDto, user: UserFromJwt): Promise<Bill>;

  abstract getBills(filters: FilterBill, user: UserFromJwt): Promise<BillDto[]>;

  abstract getAllBills(): Promise<Bill[]>;

  abstract getBillsDueTomorrow(params: FilterBillInterval): Promise<Bill[]>;

  abstract getBillsDueToday(params: FilterBillInterval): Promise<Bill[]>;

  abstract getOneBill(id: number, user: UserFromJwt): Promise<BillDto>;

  abstract updateBill(
    id: number,
    dto: UpdateBillDto,
    user: UserFromJwt,
  ): Promise<Bill>;

  abstract deleteBill(id: number, user: UserFromJwt): Promise<void>;

  abstract updateBillStatus(params: UpdateBillStatus): Promise<void>;

  abstract updateBillNotify(params: UpdateBillNotifyParams): Promise<void>;
}
