import type { AZURE_MANAGEMENT_GROUP_MAPPING_TYPE } from '@/api-clients/identity/trusted-account/schema/constant';

export type AzureManagementGroupMappingType = (typeof AZURE_MANAGEMENT_GROUP_MAPPING_TYPE)[keyof typeof AZURE_MANAGEMENT_GROUP_MAPPING_TYPE];
