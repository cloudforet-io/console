import type { UPGRADE_MODE } from '@/api-clients/plugin/plugin/constant';

export type UpgradeMode = typeof UPGRADE_MODE[keyof typeof UPGRADE_MODE];
