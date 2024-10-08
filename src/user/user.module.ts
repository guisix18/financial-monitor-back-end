import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaUserRepository } from 'src/repositories/prisma/user/prisma-user.repository';
import { UserRepository } from 'src/contracts/user/user.repository';
import { SendMailModule } from 'src/mailer/send-mail.module';

@Module({
  imports: [PrismaModule, SendMailModule],
  controllers: [UserController],
  providers: [
    UserService,
    PrismaUserRepository,
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [UserService],
})
export class UserModule {}
