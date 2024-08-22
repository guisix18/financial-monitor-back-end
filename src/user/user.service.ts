import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaUserRepository } from '../../src/repositories/prisma//user/prisma-user.repository';
import { UserInfos, CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { RecordWithId } from '../../src/common/record-with-id.dto';
import { User } from '@prisma/client';
import { MailerService } from '@nestjs-modules/mailer';
import { Request } from 'express';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: PrismaUserRepository,
    @Inject(MailerService) private readonly mailerService: MailerService,
  ) {}

  //Isso aqui tem que mudar, acho sem nexo ficar aqui mas depois eu olho isso.
  private urlGen(request: Request): string {
    const protocol = request.protocol;
    const host = request.get('Host');
    const originalUrl = request.originalUrl;
    const fullUrl = `${protocol}://${host}${originalUrl}`;

    return fullUrl;
  }

  private sendEmailValidationLink(
    email: string,
    code: string,
    request: Request,
  ) {
    const url = this.urlGen(request);

    return this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to our platform',
      text: 'You have successfully created an account',
      html: `
      <div>
      <h1>You have successfully created an account</h1>
      <p>To access our platform and enjoy all the features, you have to validate your account first in the link: ${
        url + '/validate-account/' + code
      }</p>
      </div>`,
    });
  }

  //Esse método também não é a melhor coisa do mundo.
  //Eu não gostaria de implementar filas por agora, mas acho que é o melhor a se fazer pro futuro.
  //Pois assim eu chamo o método de envio de email e ele(atualmente) nem tem como saber se vai dar errado.
  //Ao menos, o pior(eu acho) dos casos, o email não vai chegar...
  //A parte boa é que eu garanto o rápido retorno sem esperar a execução do envio do email.
  async createUser(
    dto: CreateUserDto,
    request: Request,
  ): Promise<RecordWithId> {
    const user = await this.userRepository.findUserByEmail(dto.email);

    //Preciso melhorar essa lógica aqui.
    //Ainda não finalizado.
    if (user && !user.is_active) {
      const now = new Date();
      const codeVerification = await this.userRepository.findCodeVerification(
        user.id,
      );

      const expireDate = new Date(codeVerification.expire_date);

      if (now < expireDate) {
        this.sendEmailValidationLink(dto.email, codeVerification.code, request);
      }

      return {
        id: user.id,
      };
    }

    if (user && user.is_active) {
      throw new BadRequestException('Already exists an user with this email');
    }

    const createdUser = await this.userRepository.createUser(dto);

    const codeVerification = await this.userRepository.findCodeVerification(
      createdUser.id,
    );

    this.sendEmailValidationLink(dto.email, codeVerification.code, request);

    return {
      id: createdUser.id,
    };
  }

  //Esse método vai se extender.
  //Continuar isso aqui, não esquecer
  async validateAccount(id: number): Promise<void> {
    const user = await this.userRepository.findUserComplete(id);

    if (!user) throw new NotFoundException('User not found');

    return await this.userRepository.validateAccount(user);
  }

  async findUserByEmail(email: string): Promise<User> {
    return await this.userRepository.findUserByEmail(email);
  }

  async findOneUser(id: number): Promise<UserInfos> {
    const user = await this.userRepository.findOneUser(id);

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async updateUser(dto: UpdateUserDto, id: number): Promise<RecordWithId> {
    const user = await this.findOneUser(id);

    if (!user) throw new NotFoundException('User not found');

    const updatedUser = await this.userRepository.updateUser(dto, id);

    return {
      id: updatedUser.id,
    };
  }

  async deleteUser(id: number): Promise<void> {
    return await this.userRepository.deleteUser(id);
  }
}
