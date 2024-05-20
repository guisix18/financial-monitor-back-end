import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { BillService } from './bill.service';
import { CreateBillDto } from './dto/bill.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UserFromJwt } from 'src/auth/models/UserFromJwt';
import { RecordWithId } from 'src/common/record-with-id.dto';

@Controller('bill')
export class BillController {
  constructor(private readonly billService: BillService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBill(
    @Body() dto: CreateBillDto,
    @CurrentUser() user: UserFromJwt,
  ): Promise<RecordWithId> {
    return await this.billService.createBill(dto, user);
  }
}
