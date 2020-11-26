import { KeyDataType, OperatorType } from '@/components/organisms/search/query-search/type';
import { CONTEXT_MENU_TYPE } from '@/components/organisms/context-menu/type';

/** Operator Chars */
const defaultOperatorChars = ['!', '>', '<', '=', '$'];

export const operatorChars: Record<KeyDataType, OperatorType[]> = {
    string: defaultOperatorChars,
    integer: defaultOperatorChars,
    float: defaultOperatorChars,
    boolean: defaultOperatorChars,
    datetime: ['>', '<', '='],
};

export const lastOnlyOperatorChars: OperatorType[] = ['=', '$'];


/** Operator Menu Map */
export const operatorMenuMap = {
    datetime: [
        { label: '>: Greater than', name: '>', type: CONTEXT_MENU_TYPE.item },
        { label: '<: Less than', name: '<', type: CONTEXT_MENU_TYPE.item },
        { label: '=: Range', name: '=', type: CONTEXT_MENU_TYPE.item },
    ],
};


/** Formatter Map for before emit search event */
const datetimeFormatRegex = RegExp(/^(\d{4}-\d{2}-\d{2})$/);

export const formatterMap = {
    datetime: (value) => {
        const res = datetimeFormatRegex.exec(value);
        if (res) return res[0];
        return value;
    },
};


/** Operator Checker Map */
const datetimeRegex = RegExp(/^(\d)|[-]$/);

export const operatorCheckerMap = {
    datetime: value => datetimeRegex.test(value),
};
