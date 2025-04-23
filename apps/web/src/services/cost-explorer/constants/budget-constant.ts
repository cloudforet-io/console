import type { KeyItemSet } from '@cloudforet/mirinae/types/controls/search/query-search/type';

export const BUDGET_SEARCH_HANDLERS: KeyItemSet[] = [
    {
        title: 'Properties',
        items: [
            { name: 'name', label: 'Name' },
            { name: 'time_unit', label: 'Cycle' },
            { name: 'budget_manager_id', label: 'Budget Manager' },
            { name: 'notification.recipients.users', label: 'Alert Recipients' },
        ],
    },
];
