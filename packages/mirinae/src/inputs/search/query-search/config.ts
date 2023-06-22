import type {
    OperatorType, ValueItem, ValueHandler, QueryItem, KeyDataType,
} from '@/inputs/search/query-search/type';

/** Input Type Map */
export const inputTypeMap: Record<KeyDataType, string> = {
    string: 'text',
    integer: 'number',
    float: 'number',
    boolean: 'text',
    datetime: 'text',
    object: 'text',
};

/** Operator Map */
export const supportOperatorMap: Partial<Record<KeyDataType, OperatorType[]>> = {
    integer: ['', '!', '>', '>=', '<', '<=', '=', '!='],
    float: ['', '!', '>', '>=', '<', '<=', '=', '!='],
    boolean: ['', '!', '=', '!='],
    datetime: ['', '>', '<', '='],
};


/** Placeholder Map */
export const placeholderMap: Partial<Record<KeyDataType, string>> = {
    datetime: 'YYYY-MM-DD',
};

/** Menu Type Map */
export const menuTypeMap = {
    datetime: 'OPERATOR',
};


/** Input Validator Map */
const datetimeRegex = RegExp(/^(\d)|[-]$/);

export const inputValidatorMap: Partial<Record<KeyDataType, (value: string) => boolean>> = {
    datetime: (value) => datetimeRegex.test(value),
};


/** Default Value Handler Map */
const booleanItems: ValueItem[] = [
    {
        name: 'true', label: 'TRUE',
    },
    {
        name: 'false', label: 'FALSE',
    },
];
const datetimeItems: ValueItem[] = [
    {
        label: '>: Greater than', name: '>',
    },
    {
        label: '<: Less than', name: '<',
    },
    {
        label: '=: Range', name: '=',
    },
];

export const defaultHandlerMap: Partial<Record<KeyDataType, ValueHandler>> = {
    boolean: (inputText: string|number) => {
        if (typeof inputText === 'number') return { results: booleanItems };
        const regex = RegExp(inputText || '', 'i');
        return {
            results: booleanItems.reduce((res, d) => {
                if (regex.test(d.name as string)) res.push(d);
                return res;
            }, [] as ValueItem[]),
        };
    },
    datetime: (inputText: string|number) => {
        if (typeof inputText === 'number') return { results: datetimeItems };
        const regex = RegExp(inputText || '', 'i');
        return {
            results: datetimeItems.filter((d) => regex.test(d.name)) as ValueItem[],
            menuType: 'OPERATOR' as const,
        };
    },
};


/** QueryItem Formatter Map  */
const datetimeFormatRegex = RegExp(/^(\d{4}-\d{2}-\d{2})$/);

export const formatterMap: Partial<Record<KeyDataType, (queryItem: QueryItem, currentDataType?: KeyDataType, subPath?: string) => QueryItem|null>> = {
    datetime(queryItem) {
        if (queryItem.value.name === null) return null;
        const res = datetimeFormatRegex.exec(queryItem.value.name);
        if (res) {
            queryItem.value.label = res[0];
            queryItem.value.name = res[0];
        }
        return queryItem;
    },
    object(queryItem, currentDataType, subPath) {
        if (queryItem.key) {
            queryItem.key.dataType = currentDataType;
            if (subPath) {
                queryItem.key.name = `${queryItem.key.name}.${subPath}`;
                queryItem.key.label = queryItem.key.name;
            }
        }
        return queryItem;
    },
};
