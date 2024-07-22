import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  CreateTransactionDto,
  FilterTransaction,
  TransactionDto,
} from './dto/transaction.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UserFromJwt } from 'src/auth/models/UserFromJwt';
import { TransactionService } from './transaction.service';
import { RecordWithId } from 'src/common/record-with-id.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CheckResource } from 'src/auth/decorators/check-resource.decorator';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTransaction(
    @Body() dto: CreateTransactionDto,
    @CurrentUser() user: UserFromJwt,
  ): Promise<RecordWithId> {
    return await this.transactionService.createTransaction(dto, user);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findManyTransactions(
    @Query() filters: FilterTransaction,
    @CurrentUser() user: UserFromJwt,
  ): Promise<TransactionDto[]> {
    return await this.transactionService.findManyTransactions(filters, user);
  }

  // @Patch('/:id')
  // @UseGuards(RolesGuard)
  //@CheckResource('transaction')
  // @HttpCode(HttpStatus.ACCEPTED)
  // async updateTransaction(
  //   @Param() filters: RecordWithId,
  //   @Body() dto: UpdateTransactionDto,
  //   @CurrentUser() user: UserFromJwt,
  // ): Promise<RecordWithId> {
  //   return await this.transactionService.updateTransaction(
  //     filters.id,
  //     dto,
  //     user,
  //   );
  // }
  @Delete('/:id')
  @UseGuards(RolesGuard)
  @CheckResource('transaction')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTransaction(
    @Param() filters: RecordWithId,
    @CurrentUser() user: UserFromJwt,
  ): Promise<void> {
    return await this.transactionService.deleteTransaction(filters.id, user);
  }
}
