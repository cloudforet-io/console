import type { KeyItemSet } from '@cloudforet/mirinae/types/controls/search/query-search/type';
import type { DataTableFieldType } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';

import type { ExcelDataField } from '@/lib/helper/file-download-helper/type';

export const ESCALATION_POLICY_MANAGEMENT_TABLE_FIELDS: DataTableFieldType[] = [
    { name: 'name', label: 'Name' },
    { name: 'repeat', label: 'Repeat Time' },
    { name: 'rules', label: 'Connected Channel' },
    { name: 'finish_condition', label: 'Finish Condition' },
    { name: 'created_at', label: 'Created' },
];
export const ESCALATION_POLICY_MANAGEMENT_TABLE_KEY_ITEMS_SETS: KeyItemSet[] = [{
    title: 'Properties',
    items: [
        { name: 'name', label: 'Name' },
    ],
}];
export const ALERT_EXCEL_FIELDS: ExcelDataField[] = [
    { key: 'name', name: 'Name' },
    { key: 'repeat.count', name: 'Repeat Time' },
    { key: 'rules.channels', name: 'Connected Channel' },
    { key: 'created_at', name: 'Created' },
];
