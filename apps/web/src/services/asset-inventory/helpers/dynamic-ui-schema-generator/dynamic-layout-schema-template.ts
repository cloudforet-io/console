import type { SearchSchema } from '@spaceone/design-system/src/data-display/dynamic/dynamic-layout/type/layout-schema';
import type { DynamicField } from '@spaceone/design-system/types/data-display/dynamic/dynamic-field/type/field-schema';
import type { DynamicLayout } from '@spaceone/design-system/types/data-display/dynamic/dynamic-layout/type/layout-schema';


export const getDefaultDetailSchema = (fields: DynamicField[], isTrustedAccount: boolean): { details: Partial<DynamicLayout>[] } => ({
    details: [
        {
            name: 'Base Information',
            type: 'item',
            options: {
                translation_id: 'PAGE_SCHEMA.BASE_INFO',
                fields: [
                    {
                        key: 'account_type',
                        name: 'Account Type',
                        type: 'text',
                    },
                    ...((isTrustedAccount && [{
                        key: 'resource_group',
                        name: 'Scope',
                        type: 'enum',
                        options: {
                            items: {
                                WORKSPACE: {
                                    name: 'Workspace',
                                    type: 'badge',
                                    options: {
                                        text_color: 'violet.600',
                                        background_color: 'violet.200',
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
                    ...fields.map((field) => ({
                        key: field.key,
                        name: field.name,
                        type: 'text',
                    })),
                    ...((!isTrustedAccount && [{
                        key: 'project_id',
                        name: 'Project',
                        type: 'text',
                        options: {
                            translation_id: 'PAGE_SCHEMA.PROJECT',
                        },
                        reference: {
                            resource_type: 'identity.Project',
                            reference_key: 'project_id',
                        },
                    }]) || []),
                    {
                        key: 'tags',
                        name: 'Tags',
                        type: 'dict',
                        options: {
                            translation_id: 'PAGE_SCHEMA.TAGS',
                            disable_copy: true,
                        },
                    },
                ],
            },
        },
    ],
});

export const getDefaultTableSchema = (fields: DynamicField[], isTrustedAccount: boolean): DynamicLayout => ({
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
            ...((isTrustedAccount && [{
                key: 'resource_group',
                name: 'Scope',
                type: 'enum',
                options: {
                    items: {
                        WORKSPACE: {
                            name: 'Workspace',
                            type: 'badge',
                            options: {
                                text_color: 'violet.600',
                                background_color: 'violet.200',
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
            ...fields.map((field) => ({
                key: field.key,
                name: field.name,
                type: 'text',
            })),
            ...((!isTrustedAccount && [{
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
            }]) || []),
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
