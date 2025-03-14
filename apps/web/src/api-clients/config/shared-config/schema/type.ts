import type { SHARED_CONFIG_NAMES } from '@/api-clients/config/shared-config/schema/constant';


// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SharedConfigData {

}

export type SharedConfigKey = keyof typeof SHARED_CONFIG_NAMES;
