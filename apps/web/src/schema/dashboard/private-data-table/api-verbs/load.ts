import type { Granularity } from '@/schema/dashboard/_types/widget-type';

export interface PublicDataTableLoadParameters {
    data_table_id: string;
    granularity: Granularity;
    start?: string;
    end?: string;
    sort?: any[];
    page?: Record<string, any>;
}
