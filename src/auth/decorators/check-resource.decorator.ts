import { SetMetadata } from '@nestjs/common';

const CheckResources = {
  user: 'user',
  transaction: 'transaction',
  account: 'account',
  bill: 'bill',
} as const;

export type CheckResourceType =
  (typeof CheckResources)[keyof typeof CheckResources];

export const CHECK_RESOURCE_KEY = 'check-resource-key';
export const CheckResource = (resource: CheckResourceType) =>
  SetMetadata(CHECK_RESOURCE_KEY, resource);
