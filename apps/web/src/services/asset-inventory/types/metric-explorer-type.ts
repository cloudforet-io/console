import type { GRANULARITY } from '@/services/asset-inventory/constants/metric-explorer-constant';


export type Granularity = typeof GRANULARITY[keyof typeof GRANULARITY];
