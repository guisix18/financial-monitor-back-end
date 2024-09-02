import { Bill } from '@prisma/client';

export class SendEmailValidationLinkDto {
  email: string;
  code: string;
}

export class SendBillEmailDto {
  email: string;
  bill: Bill;
}
