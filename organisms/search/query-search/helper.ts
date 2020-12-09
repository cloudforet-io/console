import {
    HandlerResponse,
    KeyItem, KeyItemSet, KeyMenuItem, OperatorType, ValueHandler, ValueItem, ValueMenuItem,
} from '@/components/organisms/search/query-search/type';
import { find } from 'lodash';


export const getRootKeyItemHandler = (keyItemSets: KeyItemSet[]): ValueHandler => (val: string) => {
    const results: KeyMenuItem[] = [];
    let totalCount = 0;

    const regex = val ? RegExp(val, 'i') : null;

    keyItemSets.forEach((set) => {
        let items: KeyItem[];
        totalCount += set.items.length;

        if (regex) items = set.items.filter(d => regex.test(d.label));
        else items = set.items;

        if (items.length > 0) {
            results.push({
                label: `${set.title} (${set.items.length})`,
                name: set.title,
                type: 'header',
            },
            ...items.map(k => ({
                ...k,
                type: 'item' as const,
                data: k,
            })));
        }
    });

    return {
        results,
        totalCount,
    };
};


export const getKeyMenuForm = (resp: HandlerResponse, selectedKeys: KeyItem[], subPath?: string): KeyMenuItem[] => {
    let key = 'Key';
    if (selectedKeys[0]) {
        key = subPath ? `[${selectedKeys[0].label}] ${subPath}` : selectedKeys[0].label;
    }

    return [
        {
            label: `${key} ${resp.totalCount === undefined ? '' : `(${resp.totalCount})`}`,
            name: key,
            type: 'header',
        },
        ...resp.results.map(d => ({
            label: d.label,
            name: d.name,
            type: (d as ValueMenuItem).type || 'item' as const,
            data: d,
        })),
    ];
};

export const getValueMenuForm = (resp: HandlerResponse, selectedKeys: KeyItem[], operator: OperatorType, subPath?: string): ValueMenuItem[] => {
    let key;
    if (selectedKeys[0]) {
        key = subPath ? `[${selectedKeys[0].label}] ${subPath}` : selectedKeys[0].label;
    }

    return [
        {
            label: `${key} ${resp.totalCount === undefined ? '' : `(${resp.totalCount})`}`,
            name: key,
            type: 'header',
        },
        ...resp.results.map(d => ({
            label: `${key}:${operator} ${d.label}`,
            name: d.name,
            type: 'item' as const,
            data: d,
        })),
    ];
};

export const getOperatorMenuForm = (items: ValueItem[], operator: OperatorType): ValueMenuItem[] => items.map(d => ({ ...d, type: 'item', data: d }));

export const findKey = (val: string, items: KeyItem[]): KeyItem|undefined => {
    const value = val.toLowerCase();
    const res = find(items, (item: KeyItem) => item.label.toLowerCase() === value || item.name.toLowerCase() === value);
    return res || undefined;
};
