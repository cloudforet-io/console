import type { DataTableGetParameters } from '@/api-clients/dashboard/private-data-table/schema/api-verbs/get';
import type { DataTableListParameters } from '@/api-clients/dashboard/private-data-table/schema/api-verbs/list';
import type { DataTableLoadParameters } from '@/api-clients/dashboard/private-data-table/schema/api-verbs/load';

export const privateDataTableKeys = {
    all: ['private-data-table'],
    list: (params: DataTableListParameters) => [...privateDataTableKeys.all, 'list', params],
    get: (idParam: DataTableGetParameters['data_table_id']) => [...privateDataTableKeys.all, 'get', idParam],
    load: (idParam: DataTableLoadParameters['data_table_id']) => [...privateDataTableKeys.all, 'load', idParam],
};
