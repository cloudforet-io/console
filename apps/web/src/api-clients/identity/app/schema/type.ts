import type { APP_STATUS_TYPE } from '@/api-clients/identity/app/schema/constant';

export type AppStatusType = typeof APP_STATUS_TYPE[keyof typeof APP_STATUS_TYPE];

