import { Request } from 'express';
import { IUser } from '../interface/user.interface';

export interface AuthRequest extends Request {
  user: IUser;
}
