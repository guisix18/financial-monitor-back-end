import { PartialType } from '@nestjs/swagger';
import { bill_types, transaction_type } from '@prisma/client';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MaxLength(255)
  @MinLength(1)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class UserItem {
  name: string;
  email: string;
  bill: Bill[];
  transaction: Transaction[];
}

export class Bill {
  description: string;
  amount: number;
  due_date: Date;
  status: bill_types;
}

export class Transaction {
  description: string;
  value: number;
  category: string;
  made_in: Date;
  type: transaction_type;
}
