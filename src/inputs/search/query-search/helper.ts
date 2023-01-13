import { find } from 'lodash';

import type {
    KeyItem, KeyItemSet, KeyMenuItem, ValueHandler, ValueItem, ValueMenuItem, MenuFormatterArgs,
} from '@/inputs/search/query-search/type';


export const getRootKeyItemHandler = (keyItemSets: KeyItemSet[]): ValueHandler => (val: string) => {
    const results: KeyMenuItem[] = [];
    let totalCount = 0;

    const regex = val ? RegExp(val, 'i') : null;

    keyItemSets.forEach((set) => {
        let items: KeyItem[];
        totalCount += set.items.length;

        if (regex) items = set.items.filter((d) => regex.test(d.label));
        else items = set.items;

        if (items.length > 0) {
            results.push(
                {
                    label: `${set.title} (${set.items.length})`,
                    name: set.title,
                    type: 'header',
                },
                ...items.map((k) => ({
                    ...k,
                    type: 'item' as const,
                    data: k,
                })),
            );
        }
    });

    return {
        results,
        totalCount,
    };
};


export const getKeyMenuForm = ({ menuResponse, selectedKeys, subPath }: MenuFormatterArgs): KeyMenuItem[] => {
    let key = 'Key';
    if (selectedKeys[0]) {
        key = subPath ? `[${selectedKeys[0].label}] ${subPath}` : selectedKeys[0].label;
    }

    return [
        {
            label: `${key} ${menuResponse.totalCount === undefined ? '' : `(${menuResponse.totalCount})`}`,
            name: key,
            type: 'header',
        },
        ...menuResponse.results.map((d) => ({
            label: d.label,
            name: d.name,
            icon: d.icon,
            imageUrl: d.imageUrl,
            type: (d as ValueMenuItem).type || 'item' as const,
            data: d,
        })),
    ];
};

export const getValueMenuForm = ({
    menuResponse, selectedKeys, operator, subPath, hideKey,
}: MenuFormatterArgs): ValueMenuItem[] => {
    let key;
    if (selectedKeys[0]) {
        key = subPath ? `[${selectedKeys[0].label}] ${subPath}` : selectedKeys[0].label;
    }

    return [
        {
            label: `${key} ${menuResponse.totalCount === undefined ? '' : `(${menuResponse.totalCount})`}`,
            name: key,
            type: 'header',
        },
        ...menuResponse.results.map((d) => ({
            label: hideKey ? d.label : `${key}:${operator} ${d.label}`,
            name: d.name,
            type: 'item' as const,
            data: d,
        })),
    ];
};

export const getOperatorMenuForm = (items: ValueItem[]): ValueMenuItem[] => items.map((d) => ({ ...d, type: 'item', data: d }));

export const findKey = (val: string, items: KeyItem[]): KeyItem|undefined => {
    const value = val.toLowerCase();
    const res = find(items, (item: KeyItem) => item.label.toLowerCase() === value || item.name.toLowerCase() === value);
    return res || undefined;
};
