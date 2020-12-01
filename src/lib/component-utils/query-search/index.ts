import {
    KeyDataType,
    KeyItem,
    ValueHandler,
    ValueHandlerMap,
    ValueItem,
} from '@/components/organisms/search/query-search/type';
import { map, size } from 'lodash';
import { SearchEnumItem, SearchEnums } from '@/components/organisms/dynamic-layout/type/layout-schema';
import { SpaceConnector } from '@/lib/space-connector';

type KeyTuple = [string, string|undefined, KeyDataType|undefined] // name, label, dataType
type KeyParam = Array<KeyTuple | string | KeyItem>

/**
 * @name makeKeyItems
 * @description A helper function that returns KeyItem[] necessary for QuerySearch component.
 * @param keys
 */
export const makeKeyItems = (keys: KeyParam): KeyItem[] => keys.map((d) => {
    if (Array.isArray(d)) return { name: d[0], label: d[1] || d[0], dataType: d[2] };
    if (typeof d === 'string') return { name: d, label: d };
    return d;
});


const getHandlerResp = (d: any, results: ValueItem[] = [], totalCount?: number) => {
    if (d === undefined || d === null) {
        return {
            results: [],
            totalCount: undefined,
            dataType: undefined,
        };
    }
    if (typeof d === 'string' || typeof d === 'boolean') {
        return {
            results,
            totalCount,
            dataType: typeof d,
        };
    }
    if (typeof d === 'number') {
        let type;
        if (Math.floor(d) !== d) type = 'float';
        else type = 'integer';

        return {
            results,
            totalCount,
            dataType: type,
        };
    }
    if (Array.isArray(d)) {
        return getHandlerResp(d[0], d.map(t => ({ label: t, name: t })), d.length);
    }

    const keys = Object.keys(d);
    return {
        results: keys.map(k => ({ label: k, name: k })),
        totalCount: totalCount || keys.length,
        dataType: 'object',
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
export function makeDistinctValueHandler(resourceType: string, distinct: string, dataType?: string, limit?: number): ValueHandler|undefined {
    if (['datetime', 'boolean'].includes(dataType || '')) return undefined;

    const param = { resource_type: resourceType, options: { limit: limit || 10 } };

    return async (inputText: string, keyItem: KeyItem, subPath?: string) => {
        try {
            const res = await SpaceConnector.client.addOns.autocomplete.distinct({
                // eslint-disable-next-line camelcase
                ...param, search: inputText, distinct_key: subPath ? `${distinct}.${subPath}` : distinct,
            });

            return getHandlerResp(res.results[0]?.key, res.results.map(d => ({ label: d.name, name: d.key })), res.total_count);

            // return {
            //     results: res.results.map(d => ({ label: d.name, name: d.key })),
            //     totalCount: res.total_count,
            // };
        } catch (e) {
            return {
                results: [],
                totalCount: 0,
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
export function makeReferenceValueHandler(resourceType: string, dataType?: string, limit?: number): ValueHandler {
    const param = { resource_type: resourceType, options: { limit: limit || 10 } };

    return async (inputText: string, keyItem: KeyItem, subPath?: string) => {
        try {
            const res = await SpaceConnector.client.addOns.autocomplete.resource({
                ...param, search: inputText,
            });
            return {
                results: res.results.map(d => ({ label: d.name, name: d.key })),
                totalCount: res.total_count,
            };
        } catch (e) {
            return {
                results: [],
                totalCount: 0,
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
    enums: SearchEnums,
): ValueHandler {
    const totalCount = size(enums);
    // @ts-ignore
    const allItems: ValueItem[] = map(enums, (d: SearchEnumItem|string, k: number|string) => {
        if (typeof d === 'string') {
            return { label: d, name: d };
        }
        return { label: d.label, name: k, icon: d.icon };
    });

    return async (inputText: string, keyItem: KeyItem, subPath?: string) => {
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
            totalCount,
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
        else res[k.name] = makeDistinctValueHandler(resourceType, k.name, k.dataType);
    });
    return res;
}
