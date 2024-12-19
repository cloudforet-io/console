import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import type { DataTableFieldType } from '@cloudforet/mirinae/src/data-display/tables/data-table/type';

import type { ExcelDataField } from '@/lib/helper/file-download-helper/type';

import type { AlertManagementTableHandlerType } from '@/services/alert-manager-v2/types/alert-manager-type';

export const ESCALATION_POLICY_MANAGEMENT_TABLE_FIELDS: DataTableFieldType[] = [
    { name: 'name', label: 'Name' },
    { name: 'repeat', label: 'Repeat Time' },
    { name: 'rules', label: 'Connected Channel' },
    { name: 'created_at', label: 'Created' },
];
export const ESCALATION_POLICY_MANAGEMENT_TABLE_HANDLER: AlertManagementTableHandlerType = {
    keyItemSets: [{
        title: 'Properties',
        items: [
            { name: 'name', label: 'Name' },
        ],
    }],
    valueHandlerMap: {
        name: makeDistinctValueHandler('alert_manager.EscalationPolicy', 'name'),
    },
};
export const ALERT_EXCEL_FIELDS: ExcelDataField[] = [
    { name: 'Name', key: 'name' },
    { name: 'State', key: 'state' },
    { name: 'Plugin', key: 'plugin_info.plugin_id' },
    { name: 'Total Requests', key: 'requests.total' },
    { name: 'Failed Requests', key: 'requests.error' },
];
