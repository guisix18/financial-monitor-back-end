export interface UserPayload {
  id: string;
  sub: string;
  email: string;
  name: string;
  is_active: boolean;
  iat?: number;
  exp?: number;
}
