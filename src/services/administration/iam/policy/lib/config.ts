import { KeyItem } from '@spaceone/console-core-lib/component-util/query-search/type';

export const POLICY_TYPES = Object.freeze({
    MANAGED: 'MANAGED',
    CUSTOM: 'CUSTOM',
} as const);
export type POLICY_TYPES = typeof POLICY_TYPES[keyof typeof POLICY_TYPES];

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
