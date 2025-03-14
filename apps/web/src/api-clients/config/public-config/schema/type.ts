import type { PUBLIC_CONFIG_NAMES } from '@/api-clients/config/public-config/schema/constant';

export type PublicConfigKey = keyof typeof PUBLIC_CONFIG_NAMES;
