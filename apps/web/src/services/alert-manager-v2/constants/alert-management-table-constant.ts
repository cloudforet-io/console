import { makeDistinctValueHandler, makeEnumValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import type { DataTableFieldType } from '@cloudforet/mirinae/src/data-display/tables/data-table/type';

import { ALERT_URGENCY } from '@/schema/alert-manager/alert/constants';

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
        alert_id: makeDistinctValueHandler('alertManager.Alert', 'alert_id'),
        title: makeDistinctValueHandler('alertManager.Alert', 'title'),
        state: makeEnumValueHandler(ALERT_URGENCY),
        service: makeDistinctValueHandler('alertManager.Alert', 'service_id'),
        category: makeDistinctValueHandler('alertManager.Alert', 'category'),
        'resource.resource_type': makeDistinctValueHandler('alertManager.Alert', 'resource.resource_type'),
    },
};
