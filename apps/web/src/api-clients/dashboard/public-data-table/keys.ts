import type { DataTableGetParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/get';
import type { DataTableListParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/list';
import type { DataTableLoadParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/load';

export const publicDataTableKeys = {
    all: ['public-data-table'] as const,
    list: (params: DataTableListParameters) => [...publicDataTableKeys.all, 'list', params] as const,
    get: (idParam: DataTableGetParameters['data_table_id']) => [...publicDataTableKeys.all, 'get', idParam] as const,
    load: (idParam: DataTableLoadParameters['data_table_id']) => [...publicDataTableKeys.all, 'load', idParam] as const,
};
