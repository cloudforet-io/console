import { KeyDataType, QueryItem } from '@/components/organisms/search/query-search/type';
import { QueryTag } from '@/components/organisms/search/query-search-tags/type';
import moment from 'moment';

const trueRegex = RegExp('true', 'i');
const falseRegex = RegExp('false', 'i');
const booleanConverter = (query: QueryItem): QueryTag => {
    const res: QueryTag = { ...query };
    const str = String(res.value.name) || '';

    if (trueRegex.test(str)) res.value = { ...res.value, name: false };
    else if (falseRegex.test(str)) res.value = { ...res.value, name: true };
    else {
        res.invalid = true;
        res.description = 'This is not suitable for boolean format.';
    }
    return res;
};

const datetimeConverter = (query: QueryItem, timezone: string): QueryTag => {
    const res: QueryTag = { ...query };
    const time = moment(query.value.name);
    if (time.isValid()) {
        res.value = {
            label: moment.tz(time, timezone).format('YYYY-MM-DD HH:mm:ss'),
            name: time.utc().toISOString(),
        };
    } else {
        res.invalid = true;
        res.description = 'This is not suitable for datetime format. e.g. 2020-05-03 00:00:00';
    }
    return res;
};

const integerConverter = (query: QueryItem): QueryTag => {
    const res: QueryTag = { ...query };
    const number = parseInt(query.value.name);
    if (Number.isNaN(number)) {
        res.invalid = true;
        res.description = 'This is not suitable for integer format.';
    } else res.value = { ...res.value, name: number };
    return res;
};

const floatConverter = (query: QueryItem): QueryTag => {
    const res: QueryTag = { ...query };
    const number = parseFloat(query.value.name);
    if (Number.isNaN(number)) {
        res.invalid = true;
        res.description = 'This is not suitable for float format.';
    } else res.value = { ...res.value, name: number };
    return res;
};

const stringConverter = (query: QueryItem): QueryTag => {
    const res: QueryTag = { ...query };
    res.value = { ...res.value, name: String(query.value.name) };
    return res;
};

interface Converter {
    (query: QueryItem, timezone: string): QueryTag;
}

const converterMap: Record<KeyDataType, Converter> = {
    boolean: booleanConverter,
    datetime: datetimeConverter,
    integer: integerConverter,
    float: floatConverter,
    string: stringConverter,
};

const convertQueryItemToQueryTag = (query: QueryItem, timezone: string): QueryTag => {
    if (query.key?.dataType) {
        const converter = converterMap[query.key.dataType];
        if (converter) return converter(query, timezone);
        return stringConverter(query);
    }
    return query;
};

export {
    convertQueryItemToQueryTag,
};
