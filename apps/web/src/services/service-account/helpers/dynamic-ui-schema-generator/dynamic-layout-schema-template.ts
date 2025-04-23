// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import type { DynamicField } from '@cloudforet/mirinae/types/data-display/dynamic/dynamic-field/type/field-schema';
import type { SearchSchema } from '@cloudforet/mirinae/types/data-display/dynamic/dynamic-layout/type/layout-schema';

import type { ItemLayout, QuerySearchTableLayout } from '@/services/service-account/helpers/dynamic-ui-schema-generator/type';

export const getDefaultDetailSchema = (fields: DynamicField[], options: {
    isTrustedAccount: boolean,
    isAdminMode?: boolean,
}): ItemLayout => ({
    name: 'Base Information',
    type: 'item',
    options: {
        translation_id: 'PAGE_SCHEMA.BASE_INFO',
        styleType: 'white',
        fields: [
            {
                key: 'account_type',
                name: 'Account Type',
                type: 'text',
            },
            ...((options.isTrustedAccount && [
                ...((!options.isAdminMode && [{
                    key: 'resource_group',
                    name: 'Scope',
                    type: 'enum',
                    options: {
                        items: {
                            WORKSPACE: {
                                name: 'Workspace',
                                type: 'badge',
                                options: {
                                    text_color: 'green.700',
                                    background_color: 'green.200',
                                },
                            },
                            DOMAIN: {
                                name: 'Domain',
                                type: 'badge',
                                options: {
                                    text_color: 'gray.900',
                                    background_color: 'gray.200',
                                },
                            },
                        },
                    },
                }]) || []) as DynamicField[],
            ]) || []),
            ...fields.map((field) => ({
                key: field.key,
                name: field.name,
                type: 'text',
            })),
            ...((!options.isTrustedAccount && [
                {
                    key: 'service_account_mgr_id',
                    name: 'Service Account Manager',
                    type: 'text',
                },
                {
                    key: 'state',
                    name: 'State',
                    type: 'text',
                },
                {
                    key: 'project_id',
                    name: 'Project',
                    type: 'text',
                    reference: {
                        resource_type: 'identity.Project',
                        reference_key: 'project_id',
                    },
                },
                {
                    key: 'trusted_account_id',
                    name: 'Trusted Account',
                    type: 'text',
                    reference: {
                        resource_type: 'identity.TrustedAccount',
                        reference_key: 'trusted_account_id',
                    },
                    options: {
                        disable_copy: true,
                    },
                },
            ]) || []),
            {
                key: 'created_at',
                name: 'Created',
                type: 'text',
            },
            {
                key: 'tags',
                name: 'Tags',
                type: 'dict',
                options: {
                    disable_copy: true,
                },
            },
        ],
    },
});

export const getDefaultTableSchema = (dynamicFields: DynamicField[], options: {
    isTrustedAccount: boolean,
    isAdminMode?: boolean,
}): QuerySearchTableLayout => ({
    name: 'Base Table',
    type: 'query-search-table',
    options: {
        search: [],
        fields: [
            {
                key: 'name',
                name: 'Name',
                type: 'text',
            },
            ...((options.isTrustedAccount && [
                ...((!options.isAdminMode && [{
                    key: 'resource_group',
                    name: 'Scope',
                    type: 'enum',
                    options: {
                        items: {
                            WORKSPACE: {
                                name: 'Workspace',
                                type: 'badge',
                                options: {
                                    text_color: 'green.700',
                                    background_color: 'green.200',
                                },
                            },
                            DOMAIN: {
                                name: 'Domain',
                                type: 'badge',
                                options: {
                                    text_color: 'gray.900',
                                    background_color: 'gray.200',
                                },
                            },
                        },
                    },
                }]) || []),
                {
                    key: 'schedule.state',
                    name: 'Auto Sync',
                    type: 'text',
                }]) || []),
            ...dynamicFields.map((field) => ({
                key: field.key,
                name: field.name,
                type: 'text',
            })),
            ...((!options.isTrustedAccount && [
                {
                    key: 'project_id',
                    name: 'Project',
                    type: 'text',
                    options: {
                        sortable: false,
                    },
                    reference: {
                        resource_type: 'identity.Project',
                        reference_key: 'project_id',
                    },
                },
                {
                    key: 'service_account_mgr_id',
                    name: 'Service Account Manager',
                    type: 'text',
                },
                {
                    key: 'state',
                    name: 'State',
                    type: 'state',
                },
                {
                    key: 'is_managed',
                    name: 'Auto Sync',
                    type: 'text',
                },
                {
                    key: 'trusted_account_id',
                    name: 'Trusted Account',
                    type: 'text',
                    reference: {
                        resource_type: 'identity.TrustedAccount',
                        reference_key: 'trusted_account_id',
                    },
                    options: {
                        disable_copy: true,
                    },
                },
            ]) || []),
            {
                key: 'created_at',
                name: 'Created',
                type: 'datetime',
                options: {
                    source_type: 'iso8601',
                },
            },
        ],
    },
});

export const getDefaultSearchSchema = (fields: DynamicField[], isTrustedAccount: boolean):{search: SearchSchema} => ({
    search: [
        {
            title: 'Properties',
            items: [
                {
                    key: isTrustedAccount ? 'trusted_account_id' : 'service_account_id',
                    name: isTrustedAccount ? 'Trusted Account ID' : 'Service Account ID',
                },
                {
                    key: 'name',
                    name: 'Name',
                },
                ...((isTrustedAccount && [{
                    key: 'resource_group',
                    name: 'Account Type',
                    enums: {
                        WORKSPACE: {
                            label: 'Trusted Account',
                        },
                        DOMAIN: {
                            label: 'Trusted Account - Managed',
                        },
                    },
                }]) || []),
                ...fields.map((field) => ({
                    key: field.key,
                    name: field.name ?? field.key,
                    type: 'text',
                })),
                {
                    key: 'service_account_mgr_id',
                    name: 'Service Account Manager',
                },
                {
                    key: 'project_id',
                    name: 'Project',
                    reference: 'identity.Project',
                },
                {
                    key: 'created_at',
                    name: 'Created',
                    data_type: 'datetime',
                },
            ],
        },
        {
            title: 'Advanced',
            items: [
                {
                    key: 'tags',
                    name: 'Tags',
                    data_type: 'object',
                },
            ],
        },
    ],
});
