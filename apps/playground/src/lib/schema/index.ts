import { render } from 'ejs';
import { get, isArray, set } from 'lodash';

import detailsSchema from './default-schema/details.json';
import { defaultSearchSchemaTemplate } from './default-schema/search-template';
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

const getMetadataSchema = (metadata: object, key: string, isMultiple: boolean) => {
    let metadataSchema = [] as any;

    if (!metadata) return metadataSchema;

    if ('view' in metadata) {
        if (isMultiple) {
            metadataSchema = get(metadata, key) || [];
        } else {
            metadataSchema = get(metadata, key) || {};
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
export const getSchema = ({
    schemaType, resourceTypeData, resourceData, referenceData, options = {},
}: GetSchemaParams) => {
    if (schemaType === 'details') {
        const cloudServiceInfo = resourceData;

        let cloudServiceTypeSubDataLayouts = [] as any;
        const subDataReferences = getMetadataSchema(cloudServiceInfo.metadata, 'view.sub_data.reference', true);
        subDataReferences.forEach((subDataReference: any) => {
            const subDataOptions = subDataReference.options || {};

            if (referenceData && subDataOptions.provider && subDataOptions.cloud_service_group && subDataOptions.cloud_service_type) {
                const cloudServiceTypeInfo = getCloudServiceTypeInfo(referenceData, subDataOptions);
                const subDataLayout = getMetadataSchema(cloudServiceTypeInfo.metadata, 'view.sub_data.layouts', false);
                cloudServiceTypeSubDataLayouts = [...cloudServiceTypeSubDataLayouts, ...subDataLayout];
            }
        });

        const subDataLayouts = getMetadataSchema(cloudServiceInfo.metadata, 'view.sub_data.layouts', true);

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
    }
    const metadata = get(resourceTypeData, 'metadata') ?? get(resourceTypeData, 'resource.metadata');
    if (schemaType === 'widget') {
        const customWidgets = getMetadataSchema(metadata, 'view.widget', false);
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

        if (options.widget_type) {
            schemaData.widget = schemaData.widget.filter((widget) => widget.type === options.widget_type);
        }

        if (options.limit) {
            schemaData.widget = schemaData.widget.slice(0, options.limit);
        }

        return schemaData;
    } if (schemaType === 'table') {
        const defaultSort = getMetadataSchema(metadata, 'view.table.layout.options.default_sort', false);
        const tableFields = getMetadataSchema(metadata, 'view.table.layout.options.fields', false);

        const schemaJSON = render(defaultTableSchemaTemplate, { fields: tableFields });
        const schemaData = JSON.parse(schemaJSON);

        set(schemaData, 'options.default_sort', defaultSort);
        set(schemaData, 'options.fields', schemaData.options.fields?.filter((d) => !d.options?.is_optional) ?? []);

        const searchFields = getMetadataSchema(metadata, 'view.search', false);
        const searchSchemaJSON = render(defaultSearchSchemaTemplate, { fields: searchFields });
        const searchSchemaData = JSON.parse(searchSchemaJSON);

        schemaData.options.search = searchSchemaData.search;
        return schemaData;
    }
    const searchFields = getMetadataSchema(metadata, 'view.search', false);
    const searchSchemaJSON = render(defaultSearchSchemaTemplate, { fields: searchFields });
    return JSON.parse(searchSchemaJSON);
};
