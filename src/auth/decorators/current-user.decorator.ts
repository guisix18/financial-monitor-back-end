import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IUser } from '../interface/user.interface';
import { AuthRequest } from '../models/AuthRequest';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): IUser => {
    const request = context.switchToHttp().getRequest<AuthRequest>();

    return request.user;
  },
);
