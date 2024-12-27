import { makeDistinctValueHandler, makeEnumValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import type { DataTableFieldType } from '@cloudforet/mirinae/src/data-display/tables/data-table/type';

import { SERVICE_CHANNEL_STATE } from '@/schema/alert-manager/service-channel/constants';

import type { ExcelDataField } from '@/lib/helper/file-download-helper/type';

import type { AlertManagementTableHandlerType } from '@/services/alert-manager/types/alert-manager-type';

export const NOTIFICATION_MANAGEMENT_TABLE_FIELDS: DataTableFieldType[] = [
    { name: 'name', label: 'Name' },
    { name: 'protocol_id', label: 'Channel' },
    { name: 'state', label: 'State' },
];
export const NOTIFICATION_MANAGEMENT_TABLE_HANDLER: AlertManagementTableHandlerType = {
    keyItemSets: [{
        title: 'Properties',
        items: [
            { name: 'name', label: 'Name' },
            { name: 'state', label: 'State' },
        ],
    }],
    valueHandlerMap: {
        name: makeDistinctValueHandler('alert_manager.ServiceChannel', 'name'),
        state: makeEnumValueHandler(SERVICE_CHANNEL_STATE),
    },
};
export const ALERT_EXCEL_FIELDS: ExcelDataField[] = [
    { name: 'Name', key: 'name' },
    { name: 'State', key: 'state' },
    { name: 'Plugin', key: 'plugin_info.plugin_id' },
    { name: 'Total Requests', key: 'requests.total' },
    { name: 'Failed Requests', key: 'requests.error' },
];

export const NOTIFICATION_DEFINITION_FIELDS: DataTableFieldType[] = [
    { label: 'Name', name: 'name' },
    { label: 'Channel', name: 'protocol_id' },
    { label: 'State', name: 'state' },
    { label: 'Member', name: 'data' },
    { label: 'Schedule', name: 'schedule', disableCopy: true },
];
