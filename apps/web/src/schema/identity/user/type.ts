import type { USER_TYPE } from '@/schema/identity/user/constant';

export type UserType = typeof USER_TYPE[keyof typeof USER_TYPE];
