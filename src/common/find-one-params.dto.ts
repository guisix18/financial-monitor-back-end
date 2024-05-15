import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class FindOneParams {
  @IsNumber()
  @Transform(({ value }) => +value)
  id: number;
}
