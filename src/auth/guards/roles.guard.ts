import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthRequest } from '../models/AuthRequest';
import {
  CHECK_RESOURCE_KEY,
  CheckResourceType,
} from '../decorators/check-resource.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: AuthRequest = context.switchToHttp().getRequest();
    const user = request.user;
    const resource: CheckResourceType = this.reflector.get<CheckResourceType>(
      CHECK_RESOURCE_KEY,
      context.getHandler(),
    );

    if (!user || !resource) {
      throw new ForbiddenException(
        'You do not have permission to access this resource.',
      );
    }

    const { id } = request.params;

    switch (resource) {
      case 'transaction':
        await this.checkTransactionPermission(user.id, +id);
        break;
      case 'user':
        await this.checkUserPermission(user.id, +id);
        break;
      case 'account':
        await this.checkAccountPermission(user.id, +id);
        break;
      case 'bill':
        await this.checkBillPermission(user.id, +id);
      default:
        throw new ForbiddenException('Invalid resource.');
    }

    return true;
  }

  private async checkTransactionPermission(
    user_id: number,
    transaction_id: number,
  ) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transaction_id },
    });

    if (!transaction || transaction.user_id !== user_id) {
      throw new ForbiddenException(
        'You do not have permission to access this transaction.',
      );
    }
  }

  private async checkUserPermission(user_id: number, target_id: number) {
    if (user_id !== target_id) {
      throw new ForbiddenException(
        'You do not have permission to access this user.',
      );
    }
  }

  private async checkAccountPermission(user_id: number, account_id: number) {
    const account = await this.prisma.account.findUnique({
      where: { id: account_id },
    });

    if (!account || account.user_id !== user_id) {
      throw new ForbiddenException(
        'You do not have permission to access this account.',
      );
    }
  }

  private async checkBillPermission(user_id: number, bill_id: number) {
    const bill = await this.prisma.bill.findUnique({
      where: { id: bill_id },
    });

    if (!bill || bill.user_id !== user_id) {
      throw new ForbiddenException(
        'You do not have permission to access this bill.',
      );
    }
  }
}
