import type { COLLECT_DATA_TYPE } from '@/services/asset-inventory-v1/constants/collector-constant';

export type CollectDataType = typeof COLLECT_DATA_TYPE[keyof typeof COLLECT_DATA_TYPE];
