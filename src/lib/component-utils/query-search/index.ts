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

    // eslint-disable-next-line camelcase
    const param = { distinct_key: distinct, resource_type: resourceType, options: { limit: limit || 10 } };

    return async (inputText: string) => {
        try {
            const res = await SpaceConnector.client.addOns.autocomplete.distinct({
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
 * @name makeReferenceValueHandler
 * @description A helper function that returns ValueHandler necessary for QuerySearch component.
 *              resourceType parameter must be supported by reference autocomplete api.
 * @param resourceType
 * @param dataType
 * @param limit
 */
export function makeReferenceValueHandler(resourceType: string, dataType?: string, limit?: number): ValueHandler {
    const param = { resource_type: resourceType, options: { limit: limit || 10 } };

    return async (inputText: string) => {
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
            res[k[0]] = makeDistinctValueHandler(resourceType, k[0], k[2]);
        } else if (typeof k === 'string') res[k] = makeDistinctValueHandler(resourceType, k);
        else res[k.name] = makeDistinctValueHandler(resourceType, k.name, k.dataType);
    });
    return res;
}
