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
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  private readonly baseUrl: string =
    this.configService.get('BASE_URL') ?? 'http://localhost:3005';

  constructor(
    private readonly userRepository: PrismaUserRepository,
    private readonly configService: ConfigService,
    @Inject(MailerService) private readonly mailerService: MailerService,
  ) {}

  private sendEmailValidationLink(email: string, code: string) {
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

  async createUser(dto: CreateUserDto): Promise<RecordWithId> {
    const user = await this.userRepository.findUserByEmail(dto.email);

    if (user && !user.is_active) {
      await this.handleInactiveUser(user);
      throw new BadRequestException(
        'User already exists but still inactive. Please check your email, we sent a new validation link!',
      );
    }

    if (user && user.is_active) {
      throw new BadRequestException('Already exists an user with this email');
    }

    const createdUser = await this.userRepository.createUser(dto);

    await this.handleNewUser(createdUser);

    return {
      id: createdUser.id,
    };
  }

  private async handleInactiveUser(user: User) {
    const now = new Date();
    const codeVerification = await this.userRepository.findCodeVerification(
      user.id,
    );

    const expireDate = new Date(codeVerification.expire_date);

    if (now < expireDate) {
      this.sendEmailValidationLink(user.email, codeVerification.code);
      return;
    }

    const newCodeVerification =
      await this.userRepository.handleCodeVerification(
        user,
        codeVerification,
        now,
      );

    this.sendEmailValidationLink(user.email, newCodeVerification.code);
  }

  private async handleNewUser(user: User) {
    const codeVerification = await this.userRepository.findCodeVerification(
      user.id,
    );

    this.sendEmailValidationLink(user.email, codeVerification.code);
  }

  async validateAccount(code: string): Promise<void> {
    const user = await this.userRepository.findUserByCode(code);

    if (!user) throw new NotFoundException('User not found');

    const codeVerification = await this.userRepository.validateAccount(user);

    if (codeVerification) {
      this.sendEmailValidationLink(user.email, codeVerification.code);
      throw new BadRequestException(
        'Code already expired, we sent a new one to your email',
      );
    }

    return;
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
