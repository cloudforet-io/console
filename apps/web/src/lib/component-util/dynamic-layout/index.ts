import type { DynamicFieldOptions, ListOptions } from '@spaceone/design-system/src/data-display/dynamic/dynamic-field/type/field-schema';
import type { DynamicLayoutType } from '@spaceone/design-system/types/data-display/dynamic/dynamic-layout/type/layout-schema';
import { forEach } from 'lodash';

import type { ConsoleDynamicField, Reference } from '@/lib/component-util/dynamic-layout/type';

interface ExcelDataField {
    key: string;
    name: string;
    type?: 'datetime'|'enum'|'size';
    enum_items?: any;
    reference?: Reference;
    options?: DynamicFieldOptions;
}

/**
 * @name isTableTypeInDynamicLayoutType
 * @description returns boolean value that match with dynamic layout type with camelcase.
 * @param type
 */
export const isTableTypeInDynamicLayoutType = (type: DynamicLayoutType): boolean => (['raw-table', 'table', 'query-search-table'].includes(type));

export const dynamicFieldsToExcelDataFields = (fields: ConsoleDynamicField[], rootPathForUnwind?:string): ExcelDataField[] => fields.map((d) => {
    const res: ExcelDataField = { key: rootPathForUnwind ? `${rootPathForUnwind}.${d.key}` : d.key, name: d.name ?? d.key, options: d.options };

    // lis type case will be deprecated
    if (d.type === 'list' && (d.options as ListOptions)?.sub_key) {
        res.key = `${d.key}.${(d.options as ListOptions).sub_key}`;
    }

    if (d.type === 'datetime' || d.type === 'size') {
        res.type = d.type;
    } else if (d.type === 'enum') {
        res.type = d.type;

        const options = (d.options as any)?.items || d.options;
        if (options) {
            const items = {};
            forEach(options, (item, k) => {
                if (typeof item === 'string') items[k] = item;
                else items[k] = item.name || k;
            });
            res.enum_items = items;
        }
    }

    if (d.reference) {
        res.reference = d.reference;
    }

    return res;
});

export default {
    getApiActionByLayoutType: isTableTypeInDynamicLayoutType,
    dynamicFieldsToExcelDataFields,
};
