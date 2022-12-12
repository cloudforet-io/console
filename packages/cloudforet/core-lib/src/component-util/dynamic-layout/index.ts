import { forEach } from 'lodash';

import type { EnumOptions } from '@/component-util/dynamic-layout/field-schema';
import type { DynamicLayoutType } from '@/component-util/dynamic-layout/layout-schema';
import type { ConsoleDynamicField, ConsoleSearchSchema, Reference } from '@/component-util/dynamic-layout/type';
import {
    makeDistinctValueHandler,
    makeEnumValueHandler,
    makeReferenceValueHandler,
} from '@/component-util/query-search';
import type { KeyItemSet, ValueHandlerMap } from '@/component-util/query-search/type';
import type { ApiFilter } from '@/space-connector/type';

interface ExcelDataField {
    key: string;
    name: string;
    type?: 'datetime'|'enum';
    enum_items?: object;
    reference?: Reference;
}

interface QuerySearchProps {
    placeholder?: string;
    focused: boolean;
    keyItemSets: KeyItemSet[];
    valueHandlerMap: ValueHandlerMap;
    value: string;
}

/**
 * @name makeQuerySearchPropsWithSearchSchema
 * @description A helper function that returns props(keyItemSets, valueHandlerMap) necessary for QuerySearch component using search schema
 * @param schema
 * @param resourceType
 */
export const makeQuerySearchPropsWithSearchSchema = (schema: ConsoleSearchSchema[], resourceType: string, filters?: ApiFilter[]): Pick<QuerySearchProps, 'keyItemSets'|'valueHandlerMap'> => {
    const querySearchProps: Pick<QuerySearchProps, 'keyItemSets'|'valueHandlerMap'> = { keyItemSets: [], valueHandlerMap: {} };

    querySearchProps.keyItemSets = schema.map((s) => ({
        title: s.title,
        items: s.items.map((d) => {
            let operators;
            if (d.enums) {
                querySearchProps.valueHandlerMap[d.key] = makeEnumValueHandler(d.enums);
                operators = ['=', '!='];
            } else if (d.reference) {
                querySearchProps.valueHandlerMap[d.key] = makeReferenceValueHandler(
                    d.reference,
                    d.data_type,
                );
                operators = ['=', '!='];
            } else {
                querySearchProps.valueHandlerMap[d.key] = makeDistinctValueHandler(
                    resourceType,
                    d.key,
                    d.data_type,
                    filters,
                );
            }

            return {
                label: d.name, name: d.key, dataType: d.data_type, operators,
            };
        }),
    }));

    return querySearchProps;
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

export const dynamicFieldsToExcelDataFields = (fields: ConsoleDynamicField[]): ExcelDataField[] => fields.map((d) => {
    const res: ExcelDataField = { key: d.key, name: d.name ?? d.key };

    // lis type case will be deprecated
    if (d.type === 'list' && (d.options as any)?.sub_key) {
        res.key = `${d.key}.${(d.options as any).sub_key}`;
    }

    if (d.type === 'datetime') {
        res.type = d.type;
    } else if (d.type === 'enum') {
        res.type = d.type;

        const options = (d.options as EnumOptions)?.items ?? d.options;
        if (options && typeof options !== 'string') {
            const items = {};
            forEach(options, (item, k) => {
                if (typeof item === 'string') items[k] = item;
                else items[k] = item.name || k;
            });
            // eslint-disable-next-line camelcase
            res.enum_items = items;
        }
    }

    if (d.reference) {
        res.reference = d.reference;
    }

    return res;
});

export default {
    makeQuerySearchPropsWithSearchSchema,
    getApiActionByLayoutType,
    dynamicFieldsToExcelDataFields,
};
