import { FILTER } from '@/services/billing/cost-management/lib/config';


export interface Period {
    start?: string;
    end?: string;
}

interface FilterItem {
    name: string;
    label: string;
}

export type CostQueryFilters = Partial<Record<FILTER, string[]>>
export type CostQueryFilterItemsMap = Partial<Record<FILTER, FilterItem[]>>
