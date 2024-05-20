import { Module } from '@nestjs/common';
import { BillService } from './bill.service';
import { BillController } from './bill.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BillRepository } from 'src/repositories/bill/bill.repository';
import { PrismaBillRepository } from 'src/repositories/prisma/bill/prisma-bill.repository';

@Module({
  imports: [PrismaModule],
  controllers: [BillController],
  providers: [
    PrismaBillRepository,
    BillService,
    {
      provide: BillRepository,
      useClass: PrismaBillRepository,
    },
  ],
})
export class BillModule {}
