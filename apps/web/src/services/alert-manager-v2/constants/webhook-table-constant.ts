import { makeDistinctValueHandler, makeEnumValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import type { DataTableFieldType } from '@cloudforet/mirinae/src/data-display/tables/data-table/type';

import { WEBHOOK_STATE } from '@/schema/alert-manager/webhook/constants';

import type { ExcelDataField } from '@/lib/helper/file-download-helper/type';

import type { AlertManagementTableHandlerType } from '@/services/alert-manager-v2/types/alert-manager-type';

export const WEBHOOK_MANAGEMENT_TABLE_FIELDS: DataTableFieldType[] = [
    { name: 'name', label: 'Name' },
    { name: 'state', label: 'State' },
    { name: 'plugin_info.plugin_id', label: 'Plugin' },
    { name: 'requests.total', label: 'Total Requests' },
    { name: 'requests.error', label: 'Failed Requests' },
];
export const WEBHOOK_MANAGEMENT_TABLE_HANDLER: AlertManagementTableHandlerType = {
    keyItemSets: [{
        title: 'Properties',
        items: [
            { name: 'name', label: 'Name' },
            { name: 'state', label: 'State' },
            { name: 'plugin_info.plugin_id', label: 'Plugin' },
        ],
    }],
    valueHandlerMap: {
        name: makeDistinctValueHandler('alert_manager.Webhook', 'name'),
        state: makeEnumValueHandler(WEBHOOK_STATE),
        'plugin_info.plugin_id': makeDistinctValueHandler('alert_manager.Webhook', 'plugin_info.plugin_id'),
    },
};
export const ALERT_EXCEL_FIELDS: ExcelDataField[] = [
    { name: 'Name', key: 'name' },
    { name: 'State', key: 'state' },
    { name: 'Plugin', key: 'plugin_info.plugin_id' },
    { name: 'Total Requests', key: 'requests.total' },
    { name: 'Failed Requests', key: 'requests.error' },
];
