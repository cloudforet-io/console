import type { KeyItemSet } from '@cloudforet/mirinae/types/controls/search/query-search/type';
import type { DataTableFieldType } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';

import type { ExcelDataField } from '@/lib/helper/file-download-helper/type';

export const WEBHOOK_MANAGEMENT_TABLE_FIELDS: DataTableFieldType[] = [
    { name: 'name', label: 'Name' },
    { name: 'state', label: 'State' },
    { name: 'plugin_info.plugin_id', label: 'Plugin' },
    { name: 'requests.total', label: 'Total Requests' },
    { name: 'requests.error', label: 'Failed Requests' },
];
export const WEBHOOK_MANAGEMENT_TABLE_KEY_ITEMS_SETS: KeyItemSet[] = [{
    title: 'Properties',
    items: [
        { name: 'name', label: 'Name' },
        { name: 'state', label: 'State' },
        { name: 'plugin_info.plugin_id', label: 'Plugin' },
    ],
}];
export const ALERT_EXCEL_FIELDS: ExcelDataField[] = [
    { name: 'Name', key: 'name' },
    { name: 'State', key: 'state' },
    { name: 'Plugin', key: 'plugin_info.plugin_id' },
    { name: 'Total Requests', key: 'requests.total' },
    { name: 'Failed Requests', key: 'requests.error' },
];

export const WEBHOOK_DEFINITION_FIELDS: DataTableFieldType[] = [
    { name: 'name', label: 'Name', disableCopy: true },
    { name: 'plugin_info.plugin_id', label: 'Plugin', disableCopy: true },
    { name: 'state', label: 'State', disableCopy: true },
    { name: 'plugin_info.version', label: 'Version' },
    { name: 'webhook_id', label: 'Webhook ID' },
    { name: 'webhook_url', label: 'Webhook URL' },
];

export const WEBHOOK_ERROR_TABLE_KEY_ITEM_SETS: KeyItemSet[] = [{
    title: 'Properties',
    items: [
        { name: 'message', label: 'Message' },
    ],
}];
export const WEBHOOK_MESSAGE_TABLE_FIELDS: DataTableFieldType[] = [
    { name: 'from', label: 'From' },
    { name: 'to', label: 'To' },
];

