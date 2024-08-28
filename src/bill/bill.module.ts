import { Module } from '@nestjs/common';
import { BillService } from './bill.service';
import { BillController } from './bill.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BillRepository } from 'src/contracts/bill/bill.repository';
import { PrismaBillRepository } from 'src/repositories/prisma/bill/prisma-bill.repository';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [BillController],
  providers: [
    PrismaBillRepository,
    BillService,
    {
      provide: BillRepository,
      useClass: PrismaBillRepository,
    },
  ],
  exports: [BillService],
})
export class BillModule {}
