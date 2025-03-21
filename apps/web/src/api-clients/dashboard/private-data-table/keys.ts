import type { DataTableGetParameters } from '@/api-clients/dashboard/private-data-table/schema/api-verbs/get';
import type { DataTableListParameters } from '@/api-clients/dashboard/private-data-table/schema/api-verbs/list';
import type { DataTableLoadParameters } from '@/api-clients/dashboard/private-data-table/schema/api-verbs/load';

export const privateDataTableKeys = {
    list: (params: DataTableListParameters) => ['private-data-table', 'list', params] as const,
    get: (idParam: DataTableGetParameters['data_table_id']) => ['private-data-table', 'get', idParam] as const,
    load: (idParam: DataTableLoadParameters['data_table_id']) => ['private-data-table', 'load', idParam] as const,
};
