import { QuerySearchProps } from '@spaceone/design-system/dist/src/inputs/search/query-search/type';
import {
    makeDistinctValueHandler,
    makeEnumValueHandler,
    makeReferenceValueHandler,
} from '@/lib/component-utils/query-search';
import { DynamicLayoutType } from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-layout/type/layout-schema';
import { Filter } from '@/lib/space-connector/type';
import { ConsoleSearchSchema } from '@/lib/component-utils/dynamic-layout/type';

/**
 * @name makeQuerySearchPropsWithSearchSchema
 * @description A helper function that returns props(keyItemSets, valueHandlerMap) necessary for QuerySearch component using search schema
 * @param schema
 * @param resourceType
 */
export const makeQuerySearchPropsWithSearchSchema = (schema: ConsoleSearchSchema[], resourceType: string, filters?: Filter[]): Pick<QuerySearchProps, 'keyItemSets'|'valueHandlerMap'> => {
    const res: Pick<QuerySearchProps, 'keyItemSets'|'valueHandlerMap'> = { keyItemSets: [], valueHandlerMap: {} };

    res.keyItemSets = schema.map(s => ({
        title: s.title,
        items: s.items.map((d) => {
            if (d.enums) {
                res.valueHandlerMap[d.key] = makeEnumValueHandler(d.enums);
            } else if (d.reference) {
                res.valueHandlerMap[d.key] = makeReferenceValueHandler(
                    d.reference,
                    d.data_type,
                );
            } else {
                res.valueHandlerMap[d.key] = makeDistinctValueHandler(
                    resourceType,
                    d.key,
                    d.data_type,
                    filters,
                );
            }

            return { label: d.name, name: d.key, dataType: d.data_type };
        }),
    }));

    return res;
};

/**
 * @name getApiActionByLayoutType
 * @description returns action name that match with dynamic layout type with camelcase.
 * @param type
 */
export const getApiActionByLayoutType = (type: DynamicLayoutType): string => {
    if (['raw-table', 'table', 'query-search-table'].includes(type)) return 'getData';
    return 'get';
};
