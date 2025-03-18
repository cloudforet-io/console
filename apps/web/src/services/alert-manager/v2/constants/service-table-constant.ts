import type { DataTableFieldType } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';


export const SERVICE_ALERT_TABLE_FIELDS: DataTableFieldType[] = [
    {
        name: 'title', label: 'Title', width: '50%',
    },
    {
        name: 'status', label: 'Status', width: '15%',
    },
    {
        name: 'urgency', label: 'Urgency', width: '15%',
    },
    {
        name: 'created_at', label: 'Created', width: '20%',
    },
];
