export interface UserPayload {
  id: number;
  sub: number;
  email: string;
  name: string;
  is_active: boolean;
  iat?: number;
  exp?: number;
}
