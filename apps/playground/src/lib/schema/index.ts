import { render } from 'ejs';
import {
    get, isArray, merge, set,
} from 'lodash';

import type { SearchSchema, DynamicLayout } from '@spaceone/design-system/types/data-display/dynamic/dynamic-layout/type/layout-schema';

import detailsSchema from './default-schema/details.json';
// import { defaultSearchSchemaTemplate } from './default-schema/search-template';
import { defaultTableSchemaTemplate } from './default-schema/table-template';
// import widgetSchema from './default-schema/widget.json';

export type SchemaType = 'table'|'details'|'search'|'widget';
interface GetSchemaParams {
    schemaType: SchemaType;
    resourceTypeData: any;
    resourceData: any;
    referenceData?: any;
    options?: {
        provider?: string;
        cloud_service_group?: string;
        cloud_service_type?: string;
        cloud_service_id?: string;
        server_id?: string;
        limit?: number;
        widget_type?: string;
    };
}

const getMetadataSchema = <T extends object>(metadata: object|null, key: string, isMultiple: boolean): null|T|T[] => {
    let metadataSchema = [] as T[];

    if (!metadata) return isMultiple ? [] as T : null;

    if ('view' in metadata) {
        if (isMultiple) {
            metadataSchema = get(metadata, key) ?? [];
        } else {
            metadataSchema = get(metadata, key) ?? null;
        }
    } else {
        Object.keys(metadata).forEach((provider) => {
            const providerMetadataSchema = get(metadata[provider], key) || [];
            if (providerMetadataSchema) {
                if (isMultiple) {
                    if (isArray(providerMetadataSchema)) {
                        metadataSchema = [...metadataSchema, ...providerMetadataSchema];
                    } else {
                        metadataSchema.push(providerMetadataSchema);
                    }
                } else {
                    metadataSchema = providerMetadataSchema;
                }
            }
        });
    }
    return metadataSchema;
};

interface SubDataOptions {
    provider: string;
    cloud_service_group: string;
    cloud_service_type: string;
}
const getCloudServiceTypeInfo = (referenceData: any, options: SubDataOptions) => {
    if (Array.isArray(referenceData)) {
        const found = referenceData.find((d) => d.provider === options.provider
                && d.group === options.cloud_service_group
                && d.name === options.cloud_service_type);
        if (found) return found;
    }
    if (typeof referenceData === 'object') {
        if (referenceData.provider === options.provider
            && referenceData.group === options.cloud_service_group
            && referenceData.name === options.cloud_service_type) {
            return referenceData;
        }
    }
    return null;
};
export const getSchema = (params: GetSchemaParams) => {
    const { schemaType } = params;
    if (schemaType === 'details') {
        return getDetailsSchema(params);
    }
    if (schemaType === 'widget') {
        return getWidgetSchema(params);
    }
    if (schemaType === 'table') {
        return getTableSchema(params);
    }
    if (schemaType === 'search') {
        return getSearchSchema(params);
    }

    return null;
};


const getDetailsSchema = ({ resourceData, referenceData }: GetSchemaParams) => {
    const cloudServiceInfo = resourceData;

    let cloudServiceTypeSubDataLayouts = [] as DynamicLayout[];
    const subDataReferences = getMetadataSchema(cloudServiceInfo.metadata, 'view.sub_data.reference', true) as DynamicLayout[];
    subDataReferences.forEach((subDataReference: any) => {
        const subDataOptions = subDataReference.options || {};

        if (referenceData && subDataOptions.provider && subDataOptions.cloud_service_group && subDataOptions.cloud_service_type) {
            const cloudServiceTypeInfo = getCloudServiceTypeInfo(referenceData, subDataOptions);
            const subDataLayout = getMetadataSchema(cloudServiceTypeInfo.metadata, 'view.sub_data.layouts', false) as DynamicLayout[];
            cloudServiceTypeSubDataLayouts = [...cloudServiceTypeSubDataLayouts, ...subDataLayout];
        }
    });

    const subDataLayouts = getMetadataSchema(cloudServiceInfo.metadata, 'view.sub_data.layouts', true) as DynamicLayout[];

    return {
        details: [
            detailsSchema,
            ...cloudServiceTypeSubDataLayouts,
            ...subDataLayouts,
            {
                name: 'Raw Data',
                type: 'raw',
                options: {
                    translation_id: 'PAGE_SCHEMA.RAW_DATA',
                },
            },
        ],
    };
};

const getWidgetSchema = ({ resourceTypeData, options }: GetSchemaParams) => {
    const metadata = get(resourceTypeData, 'metadata') ?? get(resourceTypeData, 'resource.metadata');
    const customWidgets = getMetadataSchema(metadata, 'view.widget', false) as DynamicLayout[];
    const schemaData = {
        widget: [
            ...customWidgets,
        ],
    };

    schemaData.widget.forEach((widget: any) => {
        if (widget.type === 'summary') {
            set(widget, 'options.value_options.key', 'value');
            set(widget, 'options.value_options.options.default', 0);
        }
    });

    if (options?.widget_type) {
        schemaData.widget = schemaData.widget.filter((widget) => widget.type === options.widget_type);
    }

    if (options?.limit) {
        schemaData.widget = schemaData.widget.slice(0, options.limit);
    }

    return schemaData;
};

const DEFAULT_TABLE_OPTION_SCHEMA_FOR_RENDER = { fields: [] };
const getTableSchema = (params: GetSchemaParams): DynamicLayout => {
    const { resourceTypeData } = params;
    const metadata: null|object = get(resourceTypeData, 'metadata') ?? get(resourceTypeData, 'resource.metadata');
    const metadataTableSchema = getMetadataSchema(metadata, 'view.table.layout', false) as DynamicLayout|null;

    // get table options
    const renderData = merge({ ...DEFAULT_TABLE_OPTION_SCHEMA_FOR_RENDER }, metadataTableSchema?.options ?? {});
    const defaultTableSchemaJSON = render(defaultTableSchemaTemplate, renderData);
    const defaultTableSchema = JSON.parse(defaultTableSchemaJSON);

    const tableSchemaData: Required<DynamicLayout> = merge(defaultTableSchema, metadataTableSchema);

    tableSchemaData.options.search = getSearchSchema(params);
    return tableSchemaData;
};

const getSearchSchema = ({ resourceTypeData }: GetSchemaParams): SearchSchema => {
    const metadata = get(resourceTypeData, 'metadata') ?? get(resourceTypeData, 'resource.metadata');
    const metadataSearchSchemaFields: any = getMetadataSchema(metadata, 'view.search', false) ?? [];

    // const renderData = { fields: metadataSearchSchemaFields };
    // const defaultSearchFieldsJSON = render(defaultSearchSchemaTemplate, renderData);
    // const defaultSearchSchema: SearchSchema = JSON.parse(defaultSearchFieldsJSON);
    // const mergedSearchSchema = defaultSearchSchema;

    return [{
        title: 'Properties',
        items: metadataSearchSchemaFields,
    }];
};
