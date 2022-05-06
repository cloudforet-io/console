import { KeyItem } from '@spaceone/console-core-lib/component-util/query-search/type';

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
