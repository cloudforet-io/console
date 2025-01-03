import {
    cloneDeep, flatMap, flatten, uniq,
} from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import type { ApiFilter } from '@cloudforet/core-lib/space-connector/type';
import type { KeyDataType, KeyItem, ValueItem } from '@cloudforet/mirinae/types/controls/search/query-search/type';

const getHandlerResp = (data: any, results: ValueItem[] = [], totalCount?: number, dataType?: KeyDataType) => {
    if (data === undefined || data === null) {
        return {
            results: [],
            totalCount: undefined,
            dataType: dataType || undefined,
        };
    }
    if (typeof data === 'string' || typeof data === 'boolean') {
        return {
            results,
            totalCount,
            dataType: dataType || typeof data,
        };
    }
    if (typeof data === 'number') {
        let type;
        if (Math.floor(data) !== data) type = 'float';
        else type = 'integer';

        return {
            results,
            totalCount,
            dataType: dataType || type,
        };
    }

    /* array case */
    if (Array.isArray(data)) {
        if (typeof data[0] === 'object') {
            /* when first item is array */
            if (Array.isArray(data[0])) {
                const next = uniq(flatten(data));
                return getHandlerResp(next, next.map((t) => ({ label: t, name: t })), data.length, 'object');
            }
            /* when first item is object */
            const next = uniq(flatMap(data, ((t) => Object.keys(t))));
            return getHandlerResp(next, next.map((t) => ({ label: t, name: t })), data.length, 'object');
        }

        /* when first item is primitive type */
        return getHandlerResp(data, data.map((t) => ({ label: t, name: t })), data.length, 'object');
    }

    /* object case */
    const keys = Object.keys(data);
    return {
        results: keys.map((k) => ({ label: k, name: k })),
        totalCount: keys.length,
        dataType: dataType || 'object',
    };
};

export const makeUserValueHandler = (
    resourceType: string,
    distinct: string,
    dataType?: KeyDataType,
    usersPerUserGroup?: string[],
    filters?: ApiFilter[],
    limit?: number,
    extraParams?: Record<string, any>,
) => {
    if (['datetime', 'boolean'].includes(dataType || '')) return undefined;

    const staticParam: any = {
        resource_type: resourceType,
        options: { limit: limit || 10 },
        distinct_key: distinct,
        extra_params: extraParams,
    };

    return async (inputText: string|number, keyItem: KeyItem, currentDataType?: KeyDataType, subPath?: string) => {
        const param = cloneDeep(staticParam);
        param.search = inputText;
        if (currentDataType === 'object') {
            param.options.search_type = currentDataType === 'object' ? 'key' : 'value';
        }
        if (subPath) {
            param.distinct_key = `${distinct}.${subPath}`;
        }
        if (filters) {
            param.options.filter = filters;
        }

        try {
            const res = await SpaceConnector.client.addOns.autocomplete.distinct(param);

            const filteredRes = {
                results: res.results.filter((result) => usersPerUserGroup?.includes(result.key)),
            };

            if (keyItem.dataType === 'object') return getHandlerResp(res.results[0]?.key, res.results.map((d) => ({ label: d.name, name: d.key })), res.total_count);

            return {
                results: filteredRes.results.reduce((results, d) => {
                    if (d.name !== '' && d.name !== undefined && d.name !== null) results.push({ label: d.name, name: d.key });
                    return results;
                }, []),
                totalCount: filteredRes.results.length,
            };
        } catch (e) {
            return {
                results: [],
                totalCount: 0,
            };
        }
    };
};
