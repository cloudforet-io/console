import {KeyDataType, KeyItem, QueryItem} from '@/components/organisms/search/query-search/type';
import { QueryTag } from '@/components/organisms/search/query-search-tags/type';
import moment from 'moment';
import {find} from "lodash";

const booleanConverter = (query: QueryItem): QueryTag => {
    const res: QueryTag = { ...query };
    if (res.value.name === 'false') res.value.name = false;
    else res.value.name = !!res.value.name;
    return res;
};

const datetimeConverter = (query: QueryItem): QueryTag => {
    const res: QueryTag = { ...query };
    const time = moment(String(query.value.name));
    if (time.isValid()) res.value.name = time.utc().toISOString();
    else {
        res.invalid = true;
        res.description = `${query.value.name} is not suitable for datetime format.`;
    }
    return res;
};

const integerConverter = (query: QueryItem): QueryTag => {
    const res: QueryTag = { ...query };
    const number = parseInt(query.value.name);
    if (Number.isNaN(number)) {
        res.invalid = true;
        res.description = `${query.value.name} is not suitable for integer format.`;
    } else res.value.name = number;
    return res;
};

const floatConverter = (query: QueryItem): QueryTag => {
    const res: QueryTag = { ...query };
    const number = parseFloat(query.value.name);
    if (Number.isNaN(number)) {
        res.invalid = true;
        res.description = `${query.value.name} is not suitable for float format.`;
    } else res.value.name = number;
    return res;
};

const stringConverter = (query: QueryItem): QueryTag => {
    const res: QueryTag = { ...query };
    res.value.name = String(query.value.name);
    return res;
};

interface Converter {
    (query: QueryItem): QueryTag;
}

const converterMap: Record<KeyDataType, Converter> = {
    boolean: booleanConverter,
    datetime: datetimeConverter,
    integer: integerConverter,
    float: floatConverter,
    string: stringConverter,
};

export const convertQueryItemToQueryTag = (query: QueryItem): QueryTag => {
    if (query.key?.dataType) {
        const converter = converterMap[query.key.dataType];
        if (converter) return converter(query);
        return stringConverter(query);
    }
    return query;
};
