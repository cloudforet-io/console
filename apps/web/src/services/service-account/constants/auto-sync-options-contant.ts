
export const WORKSPACE_MAPPING_OPTIONS_MAP = {
    MULTI: 'multi',
    SINGLE: 'single',
    MULTI_MANAGEMENT_GROUP_FOR_AZURE: 'multi_management_group_for_azure', // only for Azure
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
                label: 'Azure Management Group',
                value: WORKSPACE_MAPPING_OPTIONS_MAP.MULTI_MANAGEMENT_GROUP_FOR_AZURE,
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
