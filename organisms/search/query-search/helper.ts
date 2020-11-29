import {
    KeyItem, KeyMenuItem, OperatorMenuItem, OperatorType, ValueHandler, ValueItem, ValueMenuItem,
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
        inputType: 'KEY',
    };
};

export const getKeyMenu = (items: KeyItem[], keyItem: KeyItem|null, totalCount = 0): KeyMenuItem[] => {
    let key = 'Key';
    if (keyItem) {
        key = keyItem.label;
        if (Array.isArray(keyItem.subPaths)) key = `${keyItem.label}.${keyItem.subPaths.join('.')}`;
    }
    return [
        {
            label: `${key} ${totalCount === undefined ? '' : `(${totalCount})`}`,
            type: 'header',
        },
        ...items.map(d => ({
            label: d.label,
            name: d.name,
            type: 'item' as const,
            data: d,
        })),
    ];
};

export const getValueMenu = (keyItem: KeyItem, items: ValueItem[], operator: OperatorType, totalCount?: number): ValueMenuItem[] => {
    let key = keyItem.label;
    if (Array.isArray(keyItem.subPaths)) key = `${keyItem.label}.${keyItem.subPaths.join('.')}`;

    return [
        {
            label: `${key} ${totalCount === undefined ? '' : `(${totalCount})`}`,
            type: 'header',
        },
        ...items.map(d => ({
            label: `${key}:${operator} ${d.label}`,
            name: d.name,
            type: 'item' as const,
            data: d,
        })),
    ];
};


export const getOperatorMenu = (items: Array<ValueItem|OperatorType>): OperatorMenuItem[] => items.map((d) => {
    if (typeof d === 'string') {
        return {
            label: d,
            name: d,
            type: 'item' as const,
            data: d,
        };
    }
    return {
        label: d.label,
        name: d.name,
        type: 'item' as const,
        data: d.name,
    };
});

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


export const findKey = (val: string, keyMenu: KeyMenuItem[]): KeyItem|undefined => {
    const value = val.toLowerCase();
    const res = find(keyMenu,
        (item: KeyMenuItem) => (item.type === 'item'
            && ((item.label && item.label.toString().toLowerCase() === value)
                || (item.name && item.name.toLowerCase() === value)))) as KeyMenuItem|null;

    return res ? res.data : undefined;
};
