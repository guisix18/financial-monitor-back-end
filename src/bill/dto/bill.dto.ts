import { PartialType } from '@nestjs/swagger';
import { bill_types } from '@prisma/client';
import {
  IsEnum,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateBillDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  description: string;

  @IsNumber()
  amount: number;

  @IsISO8601()
  due_date: Date;
}

export class UpdateBillDto extends PartialType(CreateBillDto) {
  @IsOptional()
  @IsEnum(bill_types)
  status?: bill_types;
}

export class FilterBill {
  @IsOptional()
  @IsEnum(bill_types)
  status?: bill_types;

  @IsOptional()
  @IsISO8601()
  start_date?: Date;

  @IsOptional()
  @IsISO8601()
  end_date?: Date;
}

export class BillDto {
  id: number;
  description: string;
  amount: number;
  due_date: Date;
  status: bill_types;
  created_at: Date;
}
