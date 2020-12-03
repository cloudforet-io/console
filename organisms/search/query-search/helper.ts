import {
    HandlerResponse,
    KeyItem, KeyItemSet, KeyMenuItem, OperatorType, ValueHandler, ValueItem, ValueMenuItem,
} from '@/components/organisms/search/query-search/type';
import { find } from 'lodash';


const getAllKeyMenuItems = (keyItemSets: KeyItemSet[]): KeyMenuItem[] => {
    const allKeyMenuItems: KeyMenuItem[] = [];
    keyItemSets.forEach((d) => {
        allKeyMenuItems.push({
            label: `${d.title} (${d.items.length})`,
            name: d.title,
            type: 'header',
        },
        ...d.items.map(k => ({
            ...k,
            type: 'item' as const,
            data: k,
        })));
    });

    return allKeyMenuItems;
};

export const getRootKeyItemHandler = (keyItemSets: KeyItemSet[]): ValueHandler => {
    const allKeyMenuItems = getAllKeyMenuItems(keyItemSets);
    return (val: string) => {
        let keyItems: KeyMenuItem[] = [...allKeyMenuItems];

        if (val) {
            const regex = RegExp(val, 'i');
            keyItems = allKeyMenuItems.filter(d => d.type === 'header' || regex.test(d.label));
        }

        return {
            results: keyItems,
            totalCount: allKeyMenuItems.length,
        };
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

export const getValueItem = (val?: ValueItem|string|null, selectedKey?: KeyItem|null): null|ValueItem => {
    let valueItem: ValueItem|null;

    if (val && typeof val === 'object') valueItem = val;
    else {
        const str = typeof val === 'string' ? val.trim() : '';

        if (str) valueItem = { label: str, name: str };
        else if (selectedKey) valueItem = { label: str, name: str };
        else valueItem = null;
    }

    return valueItem;
};


export const findKey = (val: string, items: KeyItem[]): KeyItem|undefined => {
    const value = val.toLowerCase();
    const res = find(items, (item: KeyItem) => item.label.toLowerCase() === value || item.name.toLowerCase() === value);
    return res || undefined;
};
