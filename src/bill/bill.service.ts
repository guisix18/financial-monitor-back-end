import { Injectable } from '@nestjs/common';
import { PrismaBillRepository } from 'src/repositories/prisma/bill/prisma-bill.repository';
import { CreateBillDto } from './dto/bill.dto';
import { UserFromJwt } from 'src/auth/models/UserFromJwt';
import { RecordWithId } from 'src/common/record-with-id.dto';

@Injectable()
export class BillService {
  constructor(private readonly billRepository: PrismaBillRepository) {}

  async createBill(
    dto: CreateBillDto,
    user: UserFromJwt,
  ): Promise<RecordWithId> {
    const bill = await this.billRepository.createBill(dto, user);

    return {
      id: bill.id,
    };
  }
}
