import { makeDistinctValueHandler, makeEnumValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import type { DataTableFieldType } from '@cloudforet/mirinae/src/data-display/tables/data-table/type';

import { ALERT_URGENCY } from '@/schema/alert-manager/alert/constants';

import type { ExcelDataField } from '@/lib/helper/file-download-helper/type';

import type { AlertManagementTableHandlerType } from '@/services/alert-manager-v2/types/alert-manager-type';

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
    { name: 'state', label: 'Status' },
    { name: 'service_id', label: 'Service' },
    { name: 'urgency', label: 'Urgency' },
    { name: 'category', label: 'Category' },
    { name: 'resources', label: 'Resource', width: '20rem' },
    { name: 'updated_by', label: 'Updated by' },
    { name: 'resolved_by', label: 'Resolved by' },
    { name: 'acknowledged by', label: 'Acknowledged by' },
];
export const ALERT_MANAGEMENT_TABLE_HANDLER: AlertManagementTableHandlerType = {
    keyItemSets: [{
        title: 'Properties',
        items: [
            { name: 'alert_id', label: 'Alert ID' },
            { name: 'title', label: 'Title' },
            { name: 'state', label: 'Status' },
            { name: 'service_id', label: 'Service' },
            { name: 'category', label: 'Category' },
            { name: 'resource.resource_type', label: 'Resource Name' },
        ],
    }],
    valueHandlerMap: {
        alert_id: makeDistinctValueHandler('alert_manager.Alert', 'alert_id'),
        title: makeDistinctValueHandler('alert_manager.Alert', 'title'),
        state: makeEnumValueHandler(ALERT_URGENCY),
        service: makeDistinctValueHandler('alert_manager.Alert', 'service_id'),
        category: makeDistinctValueHandler('alert_manager.Alert', 'category'),
        'resource.resource_type': makeDistinctValueHandler('alert_manager.Alert', 'resource.resource_type'),
    },
};
export const ALERT_EXCEL_FIELDS: ExcelDataField[] = [
    { key: 'alert_number', name: 'No' },
    { key: 'title', name: 'Title' },
    { key: 'state', name: 'State' },
    { key: 'service_id', name: 'Service' },
    { key: 'urgency', name: 'Urgency' },
    { key: 'category', name: 'Category' },
    { key: 'resources', name: 'Resource' },
    { key: 'updated_by', name: 'Updated by' },
    { key: 'resolved_by', name: 'Resolved by' },
    { key: 'acknowledged_by', name: 'Acknowledged by' },
];
