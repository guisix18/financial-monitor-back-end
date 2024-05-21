import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class RecordWithId {
  @IsNumber()
  @Transform(({ value }) => +value)
  id: number;
}
