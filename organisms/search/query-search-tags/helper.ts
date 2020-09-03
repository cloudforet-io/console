import { KeyDataType, QueryItem } from '@/components/organisms/search/query-search/type';
import { QueryTag } from '@/components/organisms/search/query-search-tags/type';
import moment from 'moment';

const booleanConverter = (query: QueryItem): QueryTag => {
    const res: QueryTag = { ...query };
    if (res.value.name === 'false') res.value.name = false;
    else if (res.value.name === 'true') res.value.name = true;
    else {
        res.invalid = true;
        res.description = 'This is not suitable for boolean format.';
    }
    return res;
};

const datetimeConverter = (query: QueryItem, timezone: string): QueryTag => {
    const res: QueryTag = { ...query };
    const utcTime = moment(String(query.value.name));
    if (utcTime.isValid()) {
        res.value.label = moment.tz(utcTime.utc(), timezone).format('YYYY-MM-DD HH:mm:ss');
        res.value.name = utcTime.toISOString();
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
    } else res.value.name = number;
    console.debug('integerConverter', res.value.name, typeof res.value.name);
    return res;
};

const floatConverter = (query: QueryItem): QueryTag => {
    const res: QueryTag = { ...query };
    const number = parseFloat(query.value.name);
    if (Number.isNaN(number)) {
        res.invalid = true;
        res.description = 'This is not suitable for float format.';
    } else res.value.name = number;
    return res;
};

const stringConverter = (query: QueryItem): QueryTag => {
    const res: QueryTag = { ...query };
    res.value.name = String(query.value.name);
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
