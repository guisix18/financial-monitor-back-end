import { Bill } from '@prisma/client';
import { UserFromJwt } from 'src/auth/models/UserFromJwt';
import { CreateBillDto } from 'src/bill/dto/bill.dto';

export abstract class BillRepository {
  abstract createBill(dto: CreateBillDto, user: UserFromJwt): Promise<Bill>;
}
