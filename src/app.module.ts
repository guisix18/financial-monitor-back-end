import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { TransactionModule } from './transaction/transaction.module';
import { BillModule } from './bill/bill.module';
import { ScheduleModule } from '@nestjs/schedule';
import { UploadModule } from './upload/upload.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SendMailModule } from './mailer/send-mail.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    AuthModule,
    TransactionModule,
    BillModule,
    ScheduleModule.forRoot(),
    UploadModule,
    DashboardModule,
    SendMailModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
