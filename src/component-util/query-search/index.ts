import {
    map, size, flatMap, flatten, uniq, cloneDeep
} from 'lodash';
import {
    SearchEnumItem, SearchEnums,
    KeyDataType,
    KeyItem, KeyItemSet,
    ValueHandler,
    ValueHandlerMap,
    ValueItem
} from '@src/component-util/query-search/type';
import { Filter } from '@src/space-connector/type';
import { SpaceConnector } from '@src/space-connector';

type KeyTuple = [string, string|undefined, KeyDataType|undefined] // name, label, dataType
type KeyParam = Array<KeyTuple | string | KeyItemSet>

const getHandlerResp = (d: any, results: ValueItem[] = [], totalCount?: number, dataType?: KeyDataType) => {
    if (d === undefined || d === null) {
        return {
            results: [],
            totalCount: undefined,
            dataType: dataType || undefined
        };
    }
    if (typeof d === 'string' || typeof d === 'boolean') {
        return {
            results,
            totalCount,
            dataType: dataType || typeof d
        };
    }
    if (typeof d === 'number') {
        let type;
        if (Math.floor(d) !== d) type = 'float';
        else type = 'integer';

        return {
            results,
            totalCount,
            dataType: dataType || type
        };
    }

    /* array case */
    if (Array.isArray(d)) {
        if (typeof d[0] === 'object') {
            /* when first item is array */
            if (Array.isArray(d[0])) {
                const next = uniq(flatten(d));
                return getHandlerResp(next, next.map((t) => ({ label: t, name: t })), d.length, 'object');
            }
            /* when first item is object */
            const next = uniq(flatMap(d, ((t) => Object.keys(t))));
            return getHandlerResp(next, next.map((t) => ({ label: t, name: t })), d.length, 'object');
        }

        /* when first item is primitive type */
        return getHandlerResp(d, d.map((t) => ({ label: t, name: t })), d.length, 'object');
    }

    /* object case */
    const keys = Object.keys(d);
    return {
        results: keys.map((k) => ({ label: k, name: k })),
        totalCount: keys.length,
        dataType: dataType || 'object'
    };
};

/**
 * @name makeDistinctValueHandler
 * @description A helper function that returns ValueHandler necessary for QuerySearch component.
 * @param resourceType
 * @param distinct
 * @param dataType
 * @param limit
 */
export function makeDistinctValueHandler(resourceType: string, distinct: string, dataType?: KeyDataType, filters?: Filter[], limit?: number): ValueHandler|undefined {
    if (['datetime', 'boolean'].includes(dataType || '')) return undefined;

    const staticParam: any = {
        resource_type: resourceType,
        options: { limit: limit || 10 },
        // eslint-disable-next-line camelcase
        distinct_key: distinct
    };

    return async (inputText: string, keyItem: KeyItem, currentDataType?: KeyDataType, subPath?: string) => {
        const param = cloneDeep(staticParam);
        param.search = inputText;
        if (currentDataType === 'object') {
            // eslint-disable-next-line camelcase
            param.options.search_type = currentDataType === 'object' ? 'key' : 'value';
        }
        if (subPath) {
            // eslint-disable-next-line camelcase
            param.distinct_key = `${distinct}.${subPath}`;
        }
        if (filters) {
            param.options.filter = filters;
        }

        try {
            const res = await SpaceConnector.client.addOns.autocomplete.distinct(param);

            if (keyItem.dataType === 'object') return getHandlerResp(res.results[0]?.key, res.results.map((d) => ({ label: d.name, name: d.key })), res.total_count);

            return {
                results: res.results.reduce((results, d) => {
                    if (d.name !== '' && d.name !== undefined && d.name !== null) results.push({ label: d.name, name: d.key });
                    return results;
                }, []),
                totalCount: res.total_count
            };
        } catch (e) {
            return {
                results: [],
                totalCount: 0
            };
        }
    };
}

/**
 * @name makeReferenceValueHandler
 * @description A helper function that returns ValueHandler necessary for QuerySearch component.
 *              resourceType parameter must be supported by reference autocomplete api.
 * @param resourceType
 * @param dataType
 * @param limit
 */
export function makeReferenceValueHandler(resourceType: string, dataType?: KeyDataType, limit?: number): ValueHandler|undefined {
    if (['datetime', 'boolean', 'object'].includes(dataType || '')) return undefined;

    const param = { resource_type: resourceType, options: { limit: limit || 10 } };

    return async (inputText: string) => {
        try {
            const res = await SpaceConnector.client.addOns.autocomplete.resource({
                ...param, search: inputText
            });
            return {
                results: res.results.reduce((results, d) => {
                    if (d.name !== '' && d.name !== undefined && d.name !== null) results.push({ label: d.name, name: d.key });
                    return results;
                }, []),
                totalCount: res.total_count,
                dataType
            };
        } catch (e) {
            return {
                results: [],
                totalCount: 0,
                dataType
            };
        }
    };
}

/**
 * @name makeEnumValueHandler
 * @description A helper function that returns ValueHandler necessary for QuerySearch component.
 * @param enums
 */
export function makeEnumValueHandler(
    enums: SearchEnums
): ValueHandler {
    const totalCount = size(enums);
    // @ts-ignore
    const allItems: ValueItem[] = map(enums, (d: SearchEnumItem|string, k: number|string) => {
        if (typeof d === 'string') {
            return { label: d, name: d };
        }
        return { label: d.label, name: k, icon: d.icon };
    });

    return async (inputText: string) => {
        let res: ValueItem[] = [...allItems];
        if (inputText) {
            const regex = RegExp(inputText, 'i');
            res = allItems.reduce((result, d) => {
                if (regex.test(d.label) || regex.test(d.name)) result.push(d);
                return result;
            }, [] as ValueItem[]);
        }

        return {
            results: res,
            totalCount
        };
    };
}

/**
 * @name makeDistinctValueHandlerMap
 * @description A helper function that returns valueHandlerMap necessary for QuerySearch component.
 *              It uses keys as distinct keys for each valueHandler.
 * @param keys
 * @param resourceType
 */
export function makeDistinctValueHandlerMap(keys: KeyParam, resourceType: string): ValueHandlerMap {
    const res = {};
    keys.forEach((k) => {
        if (Array.isArray(k)) {
            const [name, label, dataType] = k as KeyTuple;
            res[name] = makeDistinctValueHandler(resourceType, label || name, dataType);
        } else if (typeof k === 'string') res[k] = makeDistinctValueHandler(resourceType, k);
        else {
            (k as KeyItemSet).items.forEach((d) => {
                res[d.name] = makeDistinctValueHandler(resourceType, d.name, d.dataType);
            });
        }
    });
    return res;
}
