import type { GRANULARITY, OPERATOR } from '@/services/asset-inventory/constants/metric-explorer-constant';


export type Granularity = typeof GRANULARITY[keyof typeof GRANULARITY];

export type Operator = typeof OPERATOR[keyof typeof OPERATOR];
