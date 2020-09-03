import {
    HandlerResponse,
    KeyItem, ValueItem,
} from '@/components/organisms/search/query-search/type';

const booleanItems = [
    { name: 'true', label: 'TRUE' },
    { name: 'false', label: 'FALSE' },
];
export const defaultValueHandler = (inputText: string, keyItem: KeyItem): HandlerResponse => {
    if (keyItem.dataType === 'boolean') {
        const regex = RegExp(inputText || '', 'i');
        return {
            results: booleanItems.reduce((res, d) => {
                if (regex.test(d.name)) res.push(d);
                return res;
            }, [] as ValueItem[]),
        };
    } return { results: [] };
};
