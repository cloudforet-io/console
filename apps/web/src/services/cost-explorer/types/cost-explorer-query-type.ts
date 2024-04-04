import type { ManipulateType } from 'dayjs';

import type { FILTER, GRANULARITY, GROUP_BY } from '@/services/cost-explorer/constants/cost-explorer-constant';


export interface Period {
    start?: string;
    end?: string;
}
export type RelativePeriod = {
    unit: ManipulateType;
    value: number;
    include_today: boolean;
};

export type Granularity = typeof GRANULARITY[keyof typeof GRANULARITY];
export type GroupBy = typeof GROUP_BY[keyof typeof GROUP_BY];
export type Filter = typeof FILTER[keyof typeof FILTER];

export type DisplayDataType = 'cost' | 'usage';
