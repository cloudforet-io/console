import { AZURE_MANAGEMENT_GROUP_MAPPING_TYPE } from '@/api-clients/identity/trusted-account/schema/constant';

export const WORKSPACE_MAPPING_OPTIONS_MAP = {
    MULTI: 'multi',
    SINGLE: 'single',
    MULTI_MANAGEMENT_GROUP_FOR_AZURE: 'multi_management_group_for_azure', // only for Azure
    TOP_AZURE_MANAGEMENT_GROUP_MAPPING: AZURE_MANAGEMENT_GROUP_MAPPING_TYPE.TOP_MANAGEMENT_GROUP, // only for Azure
    LEAF_AZURE_MANAGEMENT_GROUP_MAPPING: AZURE_MANAGEMENT_GROUP_MAPPING_TYPE.LEAF_MANAGEMENT_GROUP, // only for Azure
} as const;

export const CSP_AUTO_SYNC_OPTIONS_MAP = {
    aws: {
        name: 'AWS Organization',
        workspaceMappingOptions: [
            {
                label: 'Top-level Organization Units',
                value: WORKSPACE_MAPPING_OPTIONS_MAP.MULTI,
            },
            {
                label: 'AWS Organization',
                value: WORKSPACE_MAPPING_OPTIONS_MAP.SINGLE,
            },
        ],
        projectGroupMappingOptions: [
            {
                label: 'Nested Organization Units',
                value: true,
            },
        ],
    },
    azure: {
        name: 'Azure Tenant',
        workspaceMappingOptions: [
            {
                label: 'Multitenant Organization',
                value: WORKSPACE_MAPPING_OPTIONS_MAP.MULTI,
            },
            {
                label: 'Azure Management Group (Top-level)',
                value: WORKSPACE_MAPPING_OPTIONS_MAP.TOP_AZURE_MANAGEMENT_GROUP_MAPPING,
            },
            {
                label: 'Azure Management Group (Leaf-level)',
                value: WORKSPACE_MAPPING_OPTIONS_MAP.LEAF_AZURE_MANAGEMENT_GROUP_MAPPING,
            },
            {
                label: 'Azure Tenant',
                value: WORKSPACE_MAPPING_OPTIONS_MAP.SINGLE,
            },
        ],
        projectGroupMappingOptions: [
            {
                label: 'Nested Management Groups',
                value: true,
            },
        ],
    },
    google_cloud: {
        name: 'Google Cloud Organization',
        workspaceMappingOptions: [
            {
                label: 'Top-level Folders in Google Cloud Organization',
                value: WORKSPACE_MAPPING_OPTIONS_MAP.MULTI,
            },
            {
                label: 'Google Cloud Organization',
                value: WORKSPACE_MAPPING_OPTIONS_MAP.SINGLE,
            },
        ],
        projectGroupMappingOptions: [
            {
                label: 'Folders in Google Cloud Organization',
                value: true,
            },
        ],
    },
} as const;


export const PROJECT_GROUP_MAPPING_OPTIONS_MAP = {
    NESTED: true,
    SKIP: false,
};
