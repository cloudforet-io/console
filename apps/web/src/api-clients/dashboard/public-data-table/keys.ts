import type { DataTableGetParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/get';
import type { DataTableListParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/list';
import type { DataTableLoadParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/load';

export const publicDataTableKeys = {
    list: (params: DataTableListParameters) => ['public-data-table', 'list', params] as const,
    get: (idParam: DataTableGetParameters['data_table_id']) => ['public-data-table', 'get', idParam] as const,
    load: (idParam: DataTableLoadParameters['data_table_id']) => ['public-data-table', 'load', idParam] as const,
};
