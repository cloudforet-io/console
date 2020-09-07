import { SearchKeyGroup } from '@/lib/component-utils/query-search/type';
import { QuerySearchProps } from '@/components/organisms/search/query-search/type';
import {
    makeDistinctValueHandler,
    makeEnumValueHandler,
    makeReferenceValueHandler,
} from '@/lib/component-utils/query-search';

/**
 * @name makeQuerySearchPropsWithSearchSchema
 * @description A helper function that returns props(keyItems, valueHandlerMap) necessary for QuerySearch component using search schema
 * @param schema
 * @param resourceType
 */
export function makeQuerySearchPropsWithSearchSchema(schema: SearchKeyGroup, resourceType: string): Pick<QuerySearchProps, 'keyItems'|'valueHandlerMap'> {
    const res: Pick<QuerySearchProps, 'keyItems'|'valueHandlerMap'> = { keyItems: [], valueHandlerMap: {} };

    res.keyItems = schema.items.map(d => ({ label: d.name, name: d.key, dataType: d.data_type }));

    schema.items.forEach((d) => {
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
            );
        }
    });

    return res;
}
