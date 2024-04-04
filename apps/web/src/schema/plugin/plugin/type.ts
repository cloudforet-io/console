import type { UPGRADE_MODE } from '@/schema/plugin/plugin/constant';

export type UpgradeMode = typeof UPGRADE_MODE[keyof typeof UPGRADE_MODE];
