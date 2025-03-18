import type { DataTableGetParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/get';
import type { DataTableListParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/list';
import type { DataTableLoadParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/load';

export const publicDataTableKeys = {
    all: ['public-data-table'],
    list: (params: DataTableListParameters) => [...publicDataTableKeys.all, 'list', params],
    get: (idParam: DataTableGetParameters['data_table_id']) => [...publicDataTableKeys.all, 'get', idParam],
    load: (idParam: DataTableLoadParameters['data_table_id']) => [...publicDataTableKeys.all, 'load', idParam],
};
