import {
  IsISO8601,
  IsNumber,
  IsString,
  Max,
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
