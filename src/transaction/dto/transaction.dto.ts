import { PartialType } from '@nestjs/swagger';
import { transaction_type } from '@prisma/client';
import {
  IsEnum,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  @MaxLength(255)
  @MinLength(1)
  description: string;

  @IsNumber()
  @Min(0.1)
  @Max(999999999)
  value: number;

  @IsString()
  @MaxLength(255)
  @MinLength(1)
  category: string;

  @IsOptional()
  @IsEnum(transaction_type)
  type?: transaction_type;

  @IsNumber()
  send_to_id: number;
}

export class FilterTransaction {
  @IsOptional()
  @IsEnum(transaction_type)
  type?: transaction_type;

  @IsOptional()
  @IsISO8601()
  start_date?: Date;

  @IsOptional()
  @IsISO8601()
  end_date?: Date;
}

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {}

export class TransactionDto {
  id: number;
  description: string;
  value: number;
  category: string;
  created_at: Date;
  type: transaction_type;
}

export class TransactionHistoryDto {
  transferred_in: Date;
  transaction_type: transaction_type;
  transaction_id: number;
  created_by: number;
}

export class UpdateTransactionHistoryDto extends PartialType(
  TransactionHistoryDto,
) {}
