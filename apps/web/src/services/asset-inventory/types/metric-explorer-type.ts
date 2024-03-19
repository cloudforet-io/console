import type { ManipulateType } from 'dayjs';

import type { GRANULARITY, OPERATOR, PERIOD_DROPDOWN_MENU } from '@/services/asset-inventory/constants/metric-explorer-constant';


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

export type Operator = typeof OPERATOR[keyof typeof OPERATOR];

export interface MetricNamespace {
    provider: string;
    cloud_service_group: string;
}

export type PeriodDropdownMenu = typeof PERIOD_DROPDOWN_MENU[keyof typeof PERIOD_DROPDOWN_MENU];
