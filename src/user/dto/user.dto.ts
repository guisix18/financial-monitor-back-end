import { PartialType } from '@nestjs/swagger';
import { bill_types } from '@prisma/client';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { TransactionDto } from 'src/transaction/dto/transaction.dto';

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

export class UserInfos {
  name: string;
  email: string;
  bill: Bill[];
  transaction: TransactionDto[];
}

export class Bill {
  description: string;
  amount: number;
  due_date: Date;
  status: bill_types;
}
