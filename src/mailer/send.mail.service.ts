import { MailerService } from '@nestjs-modules/mailer';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SendBillEmailDto,
  SendEmailValidationLinkDto,
} from './dto/send-mail.dto';
const dayjs = require('dayjs'); //BRUH, por que não funciona sem importar assim?

@Injectable()
export class SendMailService {
  private readonly baseUrl: string =
    this.configService.get('BASE_URL') ?? 'http://localhost:3005';

  constructor(
    @Inject(MailerService) private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  sendEmailValidationLink(data: SendEmailValidationLinkDto) {
    const { email, code } = data;

    const validationUrl = `${this.baseUrl}/user/validate-account/${code}`;
    return this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to our platform',
      text: 'You have successfully created an account',
      html: `
      <div>
      <h1>You have successfully created an account</h1>
      <p>To access our platform and enjoy all the features, you have to validate your account first using the following link: 
      <a href="${validationUrl}">${validationUrl}</a></p>
      </div>`,
    });
  }

  sendEmailBillDueToday(data: SendBillEmailDto) {
    const { email, bill } = data;

    return this.mailerService.sendMail({
      to: email,
      from: 'guisix16@gmail.com',
      subject: `Sua fatura está vencida!`,
      html: `<h1>Sua conta "${bill.description}" vence hoje (${dayjs(
        bill.due_date,
      ).format('DD/MM/YYYY')}).</h1>`,
    });
  }

  sendEmailBillDueTomorrow(data: SendBillEmailDto) {
    const { email, bill } = data;

    return this.mailerService.sendMail({
      to: email,
      from: 'guisix16@gmail.com',
      subject: `Sua fatura vence amanhã!`,
      html: `<h1>Sua conta "${bill.description}" vence amanhã (${dayjs(
        bill.due_date,
      ).format('DD/MM/YYYY')}).</h1>`,
    });
  }
}
