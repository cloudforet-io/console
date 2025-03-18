import type { KeyItemSet } from '@cloudforet/mirinae/types/controls/search/query-search/type';
import type { DataTableFieldType } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';

import type { ExcelDataField } from '@/lib/helper/file-download-helper/type';

export const NOTIFICATION_MANAGEMENT_TABLE_FIELDS: DataTableFieldType[] = [
    { name: 'name', label: 'Name' },
    { name: 'protocol_id', label: 'Channel' },
    { name: 'state', label: 'State' },
];
export const NOTIFICATION_MANAGEMENT_TABLE_KEY_ITEMS_SETS: KeyItemSet[] = [{
    title: 'Properties',
    items: [
        { name: 'name', label: 'Name' },
        { name: 'state', label: 'State' },
    ],
}];
export const ALERT_EXCEL_FIELDS: ExcelDataField[] = [
    { key: 'name', name: 'Name' },
    { key: 'protocol_id', name: 'Channel' },
    { key: 'state', name: 'State' },
];
