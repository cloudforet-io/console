import type {
    QuerySearchTableOptions,
} from '@spaceone/design-system/src/data-display/dynamic/dynamic-layout/type/layout-schema';
import type { DynamicFieldType } from '@spaceone/design-system/types/data-display/dynamic/dynamic-field/type/field-schema';
import type { SearchSchema } from '@spaceone/design-system/types/data-display/dynamic/dynamic-layout/type/layout-schema';

interface Sort {
    key: string;
    desc: boolean;
}
interface Field {
    key: string;
    name: string;
    type: DynamicFieldType;
    link?: string;
}
interface ShortField {
    [name: string]: string;
}
export interface TableMetadataSchema {
    sort?: Sort;
    fields: Array<ShortField|Field>;
}
export interface SearchMetadataSchema {
    fields: Array<ShortField|Field>;
}
export interface MetadataSchema {
    table?: TableMetadataSchema;
    search?: SearchMetadataSchema;
}


export interface TableDynamicLayout {
    name: string;
    type: 'query-search-table';
    options: QuerySearchTableOptions;
}
export const convertToTableDynamicLayoutSchema = (tableMetadataSchema: TableMetadataSchema): Pick<TableDynamicLayout, 'options'> => {
    const options: QuerySearchTableOptions = {
        fields: [],
        search: [],
        default_sort: tableMetadataSchema.sort,
    };

    // set fields
    tableMetadataSchema.fields.forEach((field) => {
        const isShortField = !field.key;

        if (isShortField) {
            const name = Object.keys(field)[0];
            const key = field[name];
            options.fields.push({ key, name, type: 'text' });
        } else {
            options.fields.push({
                key: field.key,
                name: field.name,
                type: field.type,
                options: {
                    link: field.link,
                },
            });
        }
    });

    return {
        options,
    };
};

export const convertToSearchDynamicLayoutSchema = (searchMetadataSchema: SearchMetadataSchema): SearchSchema => [{
    title: 'Properties',
    items: searchMetadataSchema.fields.map((field) => {
        const isShortField = !field.key;

        if (isShortField) {
            const name = Object.keys(field)[0];
            const key = field[name];
            return { key, name };
        }
        return {
            key: field.key,
            name: field.name,
            type: field.type,
            options: {
                link: field.link,
            },
        };
    }),
}];
