import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import type { DataTableFieldType } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';

import type { ExcelDataField } from '@/lib/helper/file-download-helper/type';

import type { AlertManagementTableHandlerType } from '@/services/alert-manager/v2/types/alert-manager-type';

export const ALERT_PERIOD_DROPDOWN_MENU = {
    ALL: 'ALL',
    LAST_1_MONTH: 'LAST_1_MONTH',
    LAST_3_MONTHS: 'LAST_3_MONTHS',
    LAST_6_MONTHS: 'LAST_6_MONTHS',
    LAST_12_MONTHS: 'LAST_12_MONTHS',
    CUSTOM: 'CUSTOM',
} as const;
export const ALERT_STATUS_FILTERS = {
    OPEN: 'OPEN',
    TRIGGERED: 'TRIGGERED',
    ACKNOWLEDGED: 'ACKNOWLEDGED',
    RESOLVED: 'RESOLVED',
    IGNORED: 'IGNORED',
} as const;
export const ALERT_MANAGEMENT_TABLE_FIELDS: DataTableFieldType[] = [
    { name: 'title', label: 'Title', width: '20rem' },
    { name: 'status', label: 'Status' },
    { name: 'urgency', label: 'Urgency' },
    { name: 'labels', label: 'Labels' },
    { name: 'triggered_by', label: 'Triggered by' },
    { name: 'duration', label: 'Duration', sortable: false },
    { name: 'created_at', label: 'Created' },
    { name: 'resolved_at', label: 'Resolved' },
    { name: 'resources', label: 'Resource' },
];
export const ALERT_MANAGEMENT_TABLE_HANDLER: AlertManagementTableHandlerType = {
    keyItemSets: [{
        title: 'Properties',
        items: [
            { name: 'title', label: 'Title' },
            { name: 'labels', label: 'Labels' },
            { name: 'triggered_by', label: 'Triggered by' },
        ],
    }],
    valueHandlerMap: {
        title: makeDistinctValueHandler('alert_manager.Alert', 'title'),
        labels: makeDistinctValueHandler('alert_manager.Alert', 'labels'),
    },
};
export const ALERT_EXCEL_FIELDS: ExcelDataField[] = [
    { key: 'service_id', name: 'Service', reference: { reference_key: 'service_id', resource_type: 'alert_manager.Service' } },
    { key: 'title', name: 'Title' },
    { key: 'description', name: 'Description' },
    { key: 'status', name: 'Status' },
    { key: 'urgency', name: 'Urgency' },
    { key: 'labels', name: 'Labels' },
    { key: 'triggered_by', name: 'Triggered by', reference: { reference_key: 'webhook_id', resource_type: 'alert_manager.Webhook' } },
    { key: 'created_at', name: 'Created', type: 'datetime' },
    { key: 'resolved_at', name: 'Resolved', type: 'datetime' },
    { key: 'resources', name: 'Resource' },
];

export const ALERT_CHANNEL_TABLE_FIELDS: DataTableFieldType[] = [
    { name: 'type', label: 'Type' },
    { name: 'target', label: 'Target' },
    { name: 'name', label: 'Name' },
    { name: 'state', label: 'State' },
    { name: 'error_message', label: 'Message' },
];
