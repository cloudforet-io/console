import type { OperatorType } from '@/component-util/query-search/type';
import type { ConsoleFilterOperator, DatetimeOperator } from '@/query/type';
import type { ApiFilterOperator } from '@/space-connector/type';

export const rawQueryOperatorToApiQueryOperatorMap: Record<ConsoleFilterOperator, ApiFilterOperator> = {
    '': 'contain',
    '!': 'not_contain',
    '=': 'eq',
    '!=': 'not',
    '~': 'regex',
    /* single only */
    '>': 'gt',
    '>=': 'gte',
    '<': 'lt',
    '<=': 'lte',
    /* datetime only */
    '>t': 'datetime_gt',
    '>=t': 'datetime_gte',
    '<t': 'datetime_lt',
    '<=t': 'datetime_lte',
    '=t': 'datetime_gt',
    /* time diff only */
    '>td': 'timediff_gt',
    '>=td': 'timediff_gte',
    '<td': 'timediff_lt',
    '<=td': 'timediff_lte',
};

export const datetimeRawQueryOperatorToQueryTagOperatorMap: Record<DatetimeOperator, OperatorType> = {
    '>t': '>',
    '>=t': '>=',
    '<t': '<',
    '<=t': '<=',
    '=t': '=',
};

export const rawQueryOperatorToPluralApiQueryOperatorMap: Partial<Record<ConsoleFilterOperator, ApiFilterOperator>> = {
    '': 'contain_in',
    '!': 'not_contain_in',
    '=': 'in',
    '!=': 'not_in',
    '~': 'regex_in',
};

// export const pluralRawQueryOperatorToSingularRawQueryOperatorMap: Partial<Record<ConsoleFilterOperator, ConsoleFilterOperator>> = {
//     '': '',
//     '!': 'not_contain_in',
//     '=': 'in',
//     '!=': 'not_in',
// };
