import type { DataTableGetParameters } from '@/api-clients/dashboard/private-data-table/schema/api-verbs/get';
import type { DataTableListParameters } from '@/api-clients/dashboard/private-data-table/schema/api-verbs/list';
import type { DataTableLoadParameters } from '@/api-clients/dashboard/private-data-table/schema/api-verbs/load';

export const privateDataTableKeys = {
    all: ['private-data-table'] as const,
    list: (params: DataTableListParameters) => [...privateDataTableKeys.all, 'list', params] as const,
    get: (idParam: DataTableGetParameters['data_table_id']) => [...privateDataTableKeys.all, 'get', idParam] as const,
    load: (idParam: DataTableLoadParameters['data_table_id']) => [...privateDataTableKeys.all, 'load', idParam] as const,
};
