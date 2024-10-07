import { BadRequestException } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsOptional, IsArray, IsISO8601 } from 'class-validator';

const DataCountPanels = {
  transactions: 'transactions',
  bills: 'bills',
  bills_already_paid: 'bills_already_paid',
  bills_to_pay: 'bills_to_pay',
};

export type DataCountPanels = keyof typeof DataCountPanels;

function isDataCountPanel(data: any): data is DataCountPanels {
  if (!data.value) return undefined;

  if (!Array.isArray(data.value)) data.value = data.value.split(',');

  const validateArray = data.value.map((value: any) => {
    const parsedValue = ValidateDataCountPanel(value);
    return parsedValue;
  });

  return validateArray;
}

function ValidateDataCountPanel(
  value: any,
): (typeof DataCountPanels)[keyof typeof DataCountPanels] {
  const parse = DataCountPanels[value as DataCountPanels];
  if (parse === undefined) {
    throw new BadRequestException(`Valor ${value} não é válido para o painel`);
  }

  return parse;
}

export class FilterDataCountPanel {
  @IsOptional()
  @IsArray()
  @Transform(isDataCountPanel)
  panel?: DataCountPanels[];

  @IsISO8601()
  start_date: string;

  @IsISO8601()
  end_date: string;
}

export class DataCountDto {
  type: DataCountPanels;
  count: number;
}

export class DataCountResponseDto {
  data: DataCountDto[];
}
