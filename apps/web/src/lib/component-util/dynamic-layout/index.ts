import type { DynamicLayoutType } from '@spaceone/design-system/types/data-display/dynamic/dynamic-layout/type/layout-schema';
import { forEach } from 'lodash';

import type { ConsoleDynamicField, Reference } from '@/lib/component-util/dynamic-layout/type';

interface ExcelDataField {
    key: string;
    name: string;
    type?: 'datetime'|'enum';
    enum_items?: any;
    reference?: Reference;
}

/**
 * @name getApiActionByLayoutType
 * @description returns action name that match with dynamic layout type with camelcase.
 * @param type
 */
export const getApiActionByLayoutType = (type: DynamicLayoutType): 'getData'|'get' => {
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
    getApiActionByLayoutType,
    dynamicFieldsToExcelDataFields,
};
