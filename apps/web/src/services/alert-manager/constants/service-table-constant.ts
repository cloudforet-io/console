import type { DataTableFieldType } from '@cloudforet/mirinae/src/data-display/tables/data-table/type';


export const SERVICE_ALERT_TABLE_FIELDS: DataTableFieldType[] = [
    {
        name: 'title', label: 'Title', width: '50%', sortable: false,
    },
    {
        name: 'state', label: 'State', width: '15%', sortable: false,
    },
    {
        name: 'urgency', label: 'Urgency', width: '15%', sortable: false,
    },
    {
        name: 'created_at', label: 'Created', width: '20%', sortable: false,
    },
];
