import type {
    DynamicLayout,
    SearchSchema,
} from '@spaceone/design-system/types/data-display/dynamic/dynamic-layout/type/layout-schema';

import type {
    MetadataSchema, SearchMetadataSchema,
    TableDynamicLayout,
    TableMetadataSchema,
} from '@/lib/schema/metadata-spec-converter';
import {
    convertToSearchDynamicLayoutSchema,
    convertToTableDynamicLayoutSchema,
} from '@/lib/schema/metadata-spec-converter';

export type SchemaType = 'table'|'details'|'search'|'widget';
interface GetSchemaParams {
    metadataSchema: MetadataSchema;
}

export const getSchema = ({ metadataSchema } : GetSchemaParams): DynamicLayout|null => {
    if (metadataSchema.table) {
        return getTableSchema(metadataSchema.table, metadataSchema.search) as DynamicLayout;
    }
    return null;
};

const getTableSchema = (tableMetadataSchema: TableMetadataSchema, searchMetadataSchema?: SearchMetadataSchema): TableDynamicLayout => {
    // const renderData = tableMetadataSchema.fields ? tableMetadataSchema : { fields: [] };
    // const defaultTableSchemaJSON = render(defaultTableSchemaTemplate, renderData);
    // const defaultTableSchema = JSON.parse(defaultTableSchemaJSON);

    const tableSchema = convertToTableDynamicLayoutSchema(tableMetadataSchema);
    // const mergedSchema: TableDynamicLayout = merge(defaultTableSchema, tableSchema);

    if (searchMetadataSchema) tableSchema.options.search = getSearchSchema(searchMetadataSchema);

    return {
        name: 'Table',
        type: 'query-search-table',
        options: tableSchema.options,
    };
};

const getSearchSchema = (searchMetadataSchema: SearchMetadataSchema): SearchSchema => {
    // const renderData = searchMetadataSchema?.fields ? searchMetadataSchema : { fields: [] };
    // const defaultSearchSchemaJSON = render(defaultSearchSchemaTemplate, renderData);
    // const defaultSearchSchema: SearchSchema = JSON.parse(defaultSearchSchemaJSON);
    //
    // if (!searchMetadataSchema) return defaultSearchSchema;

    const searchSchema = convertToSearchDynamicLayoutSchema(searchMetadataSchema);
    // const mergedFirstItems = unionBy(defaultSearchSchema[0].items, searchSchema[0].items, 'name');
    // searchSchema[0].items = mergedFirstItems;
    return searchSchema;
};




// const getMetadataSchema = <T extends object>(metadata: object|null, key: string, isMultiple: boolean): null|T|T[] => {
//     let metadataSchema = [] as T[];
//
//     if (!metadata) return isMultiple ? [] as T : null;
//
//     if ('view' in metadata) {
//         if (isMultiple) {
//             metadataSchema = get(metadata, key) ?? [];
//         } else {
//             metadataSchema = get(metadata, key) ?? null;
//         }
//     } else {
//         Object.keys(metadata).forEach((provider) => {
//             const providerMetadataSchema = get(metadata[provider], key) || [];
//             if (providerMetadataSchema) {
//                 if (isMultiple) {
//                     if (isArray(providerMetadataSchema)) {
//                         metadataSchema = [...metadataSchema, ...providerMetadataSchema];
//                     } else {
//                         metadataSchema.push(providerMetadataSchema);
//                     }
//                 } else {
//                     metadataSchema = providerMetadataSchema;
//                 }
//             }
//         });
//     }
//     return metadataSchema;
// };

// interface SubDataOptions {
//     provider: string;
//     cloud_service_group: string;
//     cloud_service_type: string;
// }
// const getCloudServiceTypeInfo = (referenceData: any, options: SubDataOptions) => {
//     if (Array.isArray(referenceData)) {
//         const found = referenceData.find((d) => d.provider === options.provider
//                 && d.group === options.cloud_service_group
//                 && d.name === options.cloud_service_type);
//         if (found) return found;
//     }
//     if (typeof referenceData === 'object') {
//         if (referenceData.provider === options.provider
//             && referenceData.group === options.cloud_service_group
//             && referenceData.name === options.cloud_service_type) {
//             return referenceData;
//         }
//     }
//     return null;
// };

// const getDetailsSchema = ({ resourceData, referenceData }: GetSchemaParams) => {
//     const cloudServiceInfo = resourceData;
//
//     let cloudServiceTypeSubDataLayouts = [] as DynamicLayout[];
//     const subDataReferences = getMetadataSchema(cloudServiceInfo.metadata, 'view.sub_data.reference', true) as DynamicLayout[];
//     subDataReferences.forEach((subDataReference: any) => {
//         const subDataOptions = subDataReference.options || {};
//
//         if (referenceData && subDataOptions.provider && subDataOptions.cloud_service_group && subDataOptions.cloud_service_type) {
//             const cloudServiceTypeInfo = getCloudServiceTypeInfo(referenceData, subDataOptions);
//             const subDataLayout = getMetadataSchema(cloudServiceTypeInfo.metadata, 'view.sub_data.layouts', false) as DynamicLayout[];
//             cloudServiceTypeSubDataLayouts = [...cloudServiceTypeSubDataLayouts, ...subDataLayout];
//         }
//     });
//
//     const subDataLayouts = getMetadataSchema(cloudServiceInfo.metadata, 'view.sub_data.layouts', true) as DynamicLayout[];
//
//     return {
//         details: [
//             detailsSchema,
//             ...cloudServiceTypeSubDataLayouts,
//             ...subDataLayouts,
//             {
//                 name: 'Raw Data',
//                 type: 'raw',
//                 options: {
//                     translation_id: 'PAGE_SCHEMA.RAW_DATA',
//                 },
//             },
//         ],
//     };
// };
//
// const getWidgetSchema = ({ resourceTypeData, options }: GetSchemaParams) => {
//     const metadata = get(resourceTypeData, 'metadata') ?? get(resourceTypeData, 'resource.metadata');
//     const customWidgets = getMetadataSchema(metadata, 'view.widget', false) as DynamicLayout[];
//     const schemaData = {
//         widget: [
//             ...customWidgets,
//         ],
//     };
//
//     schemaData.widget.forEach((widget: any) => {
//         if (widget.type === 'summary') {
//             set(widget, 'options.value_options.key', 'value');
//             set(widget, 'options.value_options.options.default', 0);
//         }
//     });
//
//     if (options?.widget_type) {
//         schemaData.widget = schemaData.widget.filter((widget) => widget.type === options.widget_type);
//     }
//
//     if (options?.limit) {
//         schemaData.widget = schemaData.widget.slice(0, options.limit);
//     }
//
//     return schemaData;
// };



