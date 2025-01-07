import type { SHARED_CONFIG_NAMES } from '@/schema/config/shared-config/constant';


// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SharedConfigData {

}

export type SharedConfigKey = keyof typeof SHARED_CONFIG_NAMES;
