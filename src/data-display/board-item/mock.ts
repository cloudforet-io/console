import type {
    IconSet,
} from '@/data-display/board-item/type';

export const standardIconActionSet: IconSet[] = [
    {
        iconName: 'ic_edit',
        tooltipText: 'Edit',
        eventAction: () => {},
    },
    {
        iconName: 'ic_duplicate',
        tooltipText: 'Duplicate',
        eventAction: () => {},
    },
    {
        iconName: 'ic_delete',
        tooltipText: 'Delete',
        eventAction: () => {},
    },
];

export const extraIconActionSet: IconSet[] = [
    {
        iconName: 'ic_edit',
        eventAction: () => {},
    },
    {
        iconName: 'ic_duplicate',
        eventAction: () => {},
    },
    {
        iconName: 'ic_delete',
        eventAction: () => {},
    },
    {
        iconName: 'ic_search',
        eventAction: () => {},
    },
];
