import {
    HandlerResponse,
    KeyItem, KeyMenuItem, OperatorType, ValueHandler, ValueItem, ValueMenuItem,
} from '@/components/organisms/search/query-search/type';
import { find } from 'lodash';


export const getDefaultKeyItemHandler = (staticKeyItems): ValueHandler => (val: string, keyItem: KeyItem) => {
    let keyItems: KeyItem[] = [...staticKeyItems];

    if (val) {
        const regex = RegExp(val, 'i');
        keyItems = staticKeyItems.reduce((result, d) => {
            if (regex.test(d.label) || regex.test(d.name)) result.push(d);
            return result;
        }, [] as KeyItem[]);
    }
    return {
        results: keyItems,
        totalCount: staticKeyItems.length,
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
            type: 'header',
        },
        ...resp.results.map(d => ({
            label: d.label,
            name: d.name,
            type: 'item' as const,
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
