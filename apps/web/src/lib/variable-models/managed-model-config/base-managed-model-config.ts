import AssetAdditionalInfoKeyVariableModel from '@/lib/variable-models/managed-model/custom-resource-model/asset-additional-info-key-variable-model';
import AssetDataKeyVariableModel from '@/lib/variable-models/managed-model/custom-resource-model/asset-data-key-variable-model';
import CostAdditionalInfoKeyVariableModel from '@/lib/variable-models/managed-model/custom-resource-model/cost-additional-info-key-variable-model';
import CostDataKeyVariableModel from '@/lib/variable-models/managed-model/custom-resource-model/cost-data-key-variable-model';
import CostTagKeyVariableModel from '@/lib/variable-models/managed-model/custom-resource-model/cost-tag-key-variable-model';
import AssetDefaultFieldVariableModel from '@/lib/variable-models/managed-model/enum-model/asset-default-field-variable-model';
import CostDefaultDataTypeVariableModel from '@/lib/variable-models/managed-model/enum-model/cost-default-data-type-variable-model';
import CostDefaultFieldVariableModel from '@/lib/variable-models/managed-model/enum-model/cost-default-field-variable-model';
import GranularityVariableModel from '@/lib/variable-models/managed-model/enum-model/granularity-variable-model';
import AppVariableModel from '@/lib/variable-models/managed-model/resource-model/app-variable-model';
import CloudServiceQuerySetVariableModel from '@/lib/variable-models/managed-model/resource-model/cloud-service-query-set-variable-model';
import CloudServiceTypeVariableModel from '@/lib/variable-models/managed-model/resource-model/cloud-service-type-variable-model';
import CloudServiceVariableModel from '@/lib/variable-models/managed-model/resource-model/cloud-service-variable-model';
import CollectorVariableModel from '@/lib/variable-models/managed-model/resource-model/collector-variable-model';
import CostDataSourceVariableModel from '@/lib/variable-models/managed-model/resource-model/cost-data-source-variable-model';
import CostVariableModel from '@/lib/variable-models/managed-model/resource-model/cost-variable-model';
import MetricDataVariableModel from '@/lib/variable-models/managed-model/resource-model/metric-data-variable-model';
import ProjectGroupVariableModel from '@/lib/variable-models/managed-model/resource-model/project-group-variable-model';
import ProjectVariableModel from '@/lib/variable-models/managed-model/resource-model/project-variable-model';
import ProviderVariableModel from '@/lib/variable-models/managed-model/resource-model/provider-variable-model';
import RegionVariableModel from '@/lib/variable-models/managed-model/resource-model/region-variable-model';
import RoleVariableModel from '@/lib/variable-models/managed-model/resource-model/role-variable-model';
import SecretVariableModel from '@/lib/variable-models/managed-model/resource-model/secret-variable-model';
import ServiceAccountVariableModel from '@/lib/variable-models/managed-model/resource-model/service-account-variable-model';
import ServiceVariableModel from '@/lib/variable-models/managed-model/resource-model/service-variable-model';
import UnifiedCostVariableModel from '@/lib/variable-models/managed-model/resource-model/unified-cost-variable-model';
import UserGroupVariableModel from '@/lib/variable-models/managed-model/resource-model/user-group-variable-model';
import UserVariableModel from '@/lib/variable-models/managed-model/resource-model/user-variable-model';
import WebhookVariableModel from '@/lib/variable-models/managed-model/resource-model/webhook-variable-model';
import WorkspaceGroupVariableModel from '@/lib/variable-models/managed-model/resource-model/workspace-group-variable-model';
import WorkspaceVariableModel from '@/lib/variable-models/managed-model/resource-model/workspace-variable-model';

export const ENUM_VARIABLE_MODELS = {
    granularity: GranularityVariableModel,
    cost_default_field: CostDefaultFieldVariableModel,
    cost_default_data_type: CostDefaultDataTypeVariableModel,
    asset_default_field: AssetDefaultFieldVariableModel,
} as const;
const RESOURCE_VARIABLE_MODELS = {
    cost_data_source: CostDataSourceVariableModel,
    provider: ProviderVariableModel,
    cloud_service_query_set: CloudServiceQuerySetVariableModel,
    cloud_service: CloudServiceVariableModel,
    cloud_service_type: CloudServiceTypeVariableModel,
    collector: CollectorVariableModel,
    project_group: ProjectGroupVariableModel,
    project: ProjectVariableModel,
    region: RegionVariableModel,
    secret: SecretVariableModel,
    service_account: ServiceAccountVariableModel,
    user: UserVariableModel,
    user_group: UserGroupVariableModel,
    webhook: WebhookVariableModel,
    workspace: WorkspaceVariableModel,
    workspace_group: WorkspaceGroupVariableModel,
    cost: CostVariableModel,
    unified_cost: UnifiedCostVariableModel,
    metric_data: MetricDataVariableModel,
    role: RoleVariableModel,
    service: ServiceVariableModel,
    app: AppVariableModel,
} as const;
const CUSTOM_RESOURCE_VARIABLE_MODELS = {
    cost_additional_info_key: CostAdditionalInfoKeyVariableModel,
    cost_tag_key: CostTagKeyVariableModel,
    cost_data_key: CostDataKeyVariableModel,
    asset_data_key: AssetDataKeyVariableModel,
    asset_additional_info_key: AssetAdditionalInfoKeyVariableModel,
} as const;

export const MANAGED_VARIABLE_MODELS = {
    ...ENUM_VARIABLE_MODELS,
    ...RESOURCE_VARIABLE_MODELS,
    ...CUSTOM_RESOURCE_VARIABLE_MODELS,
} as const;

export type ManagedVariableModelKey = keyof typeof MANAGED_VARIABLE_MODELS;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const MANAGED_VARIABLE_MODEL_KEY_MAP: Record<ManagedVariableModelKey, ManagedVariableModelKey> = {};
Object.keys(MANAGED_VARIABLE_MODELS).forEach((key) => {
    MANAGED_VARIABLE_MODEL_KEY_MAP[key] = key;
});
