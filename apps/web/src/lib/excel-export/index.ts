import { forEach } from 'lodash';

import type { DynamicFieldOptions, ListOptions, DynamicField } from '@cloudforet/mirinae/types/data-display/dynamic/dynamic-field/type/field-schema';


interface ExcelDataField {
    key: string;
    name: string;
    type?: 'datetime'|'enum'|'size';
    enum_items?: any;
    reference?: DynamicField['reference'];
    options?: DynamicFieldOptions;
}

export const dynamicFieldsToExcelDataFields = (fields: DynamicField[], rootPathForUnwind?:string): ExcelDataField[] => fields.map((d) => {
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
