import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BillService } from './bill.service';
import {
  BillDto,
  CreateBillDto,
  FilterBill,
  UpdateBillDto,
} from './dto/bill.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UserFromJwt } from 'src/auth/models/UserFromJwt';
import { RecordWithId } from 'src/common/record-with-id.dto';
import { FindOneParams } from 'src/common/find-one-params.dto';
import { CheckResource } from 'src/auth/decorators/check-resource.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';

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

  @Get()
  @HttpCode(HttpStatus.OK)
  async getBills(
    @Query() filters: FilterBill,
    @CurrentUser() user: UserFromJwt,
  ): Promise<BillDto[]> {
    return await this.billService.getBills(filters, user);
  }

  @Get('/:id')
  @UseGuards(RolesGuard)
  @CheckResource('bill')
  @HttpCode(HttpStatus.OK)
  async getOneBill(
    @Param() filters: FindOneParams,
    @CurrentUser() user: UserFromJwt,
  ): Promise<BillDto> {
    return await this.billService.getOneBill(filters.id, user);
  }

  @Patch('/:id')
  @UseGuards(RolesGuard)
  @CheckResource('bill')
  @HttpCode(HttpStatus.ACCEPTED)
  async updateBill(
    @Param() filters: FindOneParams,
    @Body() dto: UpdateBillDto,
    @CurrentUser() user: UserFromJwt,
  ): Promise<RecordWithId> {
    return await this.billService.updateBill(filters.id, dto, user);
  }

  @Delete('/:id')
  @UseGuards(RolesGuard)
  @CheckResource('bill')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBill(
    @Param() filters: FindOneParams,
    @CurrentUser() user: UserFromJwt,
  ): Promise<void> {
    return await this.billService.deleteBill(filters.id, user);
  }
}
