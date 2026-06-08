import type { AZURE_MANAGEMENT_GROUP_MAPPING_TYPE } from '@/schema/identity/trusted-account/constant';

export type AzureManagementGroupMappingType = (typeof AZURE_MANAGEMENT_GROUP_MAPPING_TYPE)[keyof typeof AZURE_MANAGEMENT_GROUP_MAPPING_TYPE];
