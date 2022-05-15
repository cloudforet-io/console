import { KeyItem } from '@spaceone/console-core-lib/component-util/query-search/type';

export const PolicyTypes = Object.freeze({
    MANAGED: 'MANAGED',
    CUSTOM: 'CUSTOM',
    ALL: 'ALL',
} as const);
export type PolicyTypes = typeof PolicyTypes[keyof typeof PolicyTypes];

export const PolicyState = {
    ENABLED: 'ENABLED',
    DISABLED: 'DISABLED',
} as const;
export type PolicyState = typeof PolicyState[keyof typeof PolicyState];

export const policySearchHandlers = {
    keyItemSets: [{
        title: 'Properties',
        items: [
            {
                name: 'name',
                label: 'Name',
                // reference: 'identity.User',
            },
            {
                name: 'policy_id',
                label: 'ID',
            },
            {
                name: 'tags',
                label: 'Description',
            },
            {
                name: 'created_at',
                label: 'Created',
            },
        ] as KeyItem[],
    }],
};
