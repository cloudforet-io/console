import type {
    DynamicField,
    EnumOptions,
} from '@spaceone/design-system/types/data-display/dynamic/dynamic-field/type/field-schema';
import type {
    DynamicLayoutType,
    SearchSchema,
} from '@spaceone/design-system/types/data-display/dynamic/dynamic-layout/type/layout-schema';
import type { KeyItemSet, ValueHandlerMap } from '@spaceone/design-system/types/inputs/search/query-search/type';
import { forEach } from 'lodash';

import {
    makeDistinctValueHandler,
    makeEnumValueHandler,
    makeReferenceValueHandler,
} from '@/component-util/query-search';
import type { ApiFilter } from '@/space-connector/type';

interface ExcelDataField {
    key: string;
    name: string;
    type?: 'datetime'|'enum';
    enum_items?: object;
    reference?: DynamicField['reference'];
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
export const makeQuerySearchPropsWithSearchSchema = (schema: SearchSchema, resourceType: string, filters?: ApiFilter[]): Pick<QuerySearchProps, 'keyItemSets'|'valueHandlerMap'> => {
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
 * @name isTableTypeInDynamicLayoutType
 * @description returns boolean value that match with dynamic layout type with camelcase.
 * @param type
 */
export const isTableTypeInDynamicLayoutType = (type: DynamicLayoutType): boolean => (['raw-table', 'table', 'query-search-table'].includes(type));


/**
 * @name getApiActionByLayoutType
 * @description returns action name that match with dynamic layout type with camelcase.
 * @param type
 */
export const getApiActionByLayoutType = (type: DynamicLayoutType): string => {
    if (isTableTypeInDynamicLayoutType(type)) return 'getData';
    return 'get';
};

export const dynamicFieldsToExcelDataFields = (fields: DynamicField[]): ExcelDataField[] => fields.map((d) => {
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
    isTableTypeInDynamicLayoutType,
    getApiActionByLayoutType,
    dynamicFieldsToExcelDataFields,
};
