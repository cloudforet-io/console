import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import type { DataTableFieldType } from '@cloudforet/mirinae/src/data-display/tables/data-table/type';

import type { ExcelDataField } from '@/lib/helper/file-download-helper/type';

import type { AlertManagementTableHandlerType } from '@/services/alert-manager/types/alert-manager-type';

export const ALERT_STATUS_FILTERS = {
    OPEN: 'OPEN',
    TRIGGERED: 'TRIGGERED',
    ACKNOWLEDGED: 'ACKNOWLEDGED',
    RESOLVED: 'RESOLVED',
    ERROR: 'ERROR',
} as const;
export const ALERT_MANAGEMENT_TABLE_FIELDS: DataTableFieldType[] = [
    { name: 'alert_number', label: 'No' },
    { name: 'title', label: 'Title', width: '20rem' },
    { name: 'status', label: 'Status' },
    { name: 'service_id', label: 'Service' },
    { name: 'urgency', label: 'Urgency' },
    { name: 'resources', label: 'Resource', width: '20rem' },
    { name: 'created_at', label: 'Created at' },
];
export const ALERT_MANAGEMENT_TABLE_HANDLER: AlertManagementTableHandlerType = {
    keyItemSets: [{
        title: 'Properties',
        items: [
            { name: 'alert_id', label: 'Alert ID' },
            { name: 'title', label: 'Title' },
            { name: 'resource.resource_type', label: 'Resource Name' },
        ],
    }],
    valueHandlerMap: {
        alert_id: makeDistinctValueHandler('alert_manager.Alert', 'alert_id'),
        title: makeDistinctValueHandler('alert_manager.Alert', 'title'),
        'resource.resource_type': makeDistinctValueHandler('alert_manager.Alert', 'resource.resource_type'),
    },
};
export const ALERT_EXCEL_FIELDS: ExcelDataField[] = [
    { key: 'alert_id', name: 'No' },
    { key: 'title', name: 'Title' },
    { key: 'status', name: 'Status' },
    { key: 'service_id', name: 'Service' },
    { key: 'urgency', name: 'Urgency' },
    { key: 'resources', name: 'Resource' },
    { key: 'created_at', name: 'Created at' },
];
