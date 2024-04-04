import type { APP_STATUS_TYPE } from '@/schema/identity/app/constant';

export type AppStatusType = typeof APP_STATUS_TYPE[keyof typeof APP_STATUS_TYPE];

