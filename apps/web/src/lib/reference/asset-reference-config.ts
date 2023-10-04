export const ASSET_VARIABLE_TYPE_INFO = {
    asset_compliance_framework: {
        type: 'asset_compliance_framework',
        key: 'name',
        name: 'Compliance Framework',
    },
    asset_account: {
        type: 'asset_account',
        key: 'account',
        name: 'AWS Account ID (Asset)',
    },
    // asset_requirement_id: {
    //     type: 'asset_requirement_id',
    //     key: 'data.requirement_id',
    //     name: 'Requirement ID',
    // },
    asset_service: {
        type: 'asset_service',
        key: 'additional_info.service',
        name: 'Service',
    },
} as const;
