import type {
    IEnumVariableModel,
    IResourceVariableModel,
    Value,
} from '@/lib/variable-models/_base/types';
import AssetDefaultFieldVariableModel from '@/lib/variable-models/managed/enum-model/asset-default-field-variable-model';
import CostDefaultDataTypeVariableModel from '@/lib/variable-models/managed/enum-model/cost-default-data-type-variable-model';
import CostDefaultFieldVariableModel from '@/lib/variable-models/managed/enum-model/cost-default-field-variable-model';
import GranularityVariableModel from '@/lib/variable-models/managed/enum-model/granularity-variable-model';
import CloudServiceQuerySetVariableModel from '@/lib/variable-models/managed/resource-model/cloud-service-query-set-variable-model';
import CloudServiceTypeVariableModel from '@/lib/variable-models/managed/resource-model/cloud-service-type-variable-model';
import CollectorVariableModel from '@/lib/variable-models/managed/resource-model/collector-variable-model';
import CostDataSourceVariableModel from '@/lib/variable-models/managed/resource-model/cost-data-source-variable-model';
import ProjectGroupVariableModel from '@/lib/variable-models/managed/resource-model/project-group-variable-model';
import ProjectVariableModel from '@/lib/variable-models/managed/resource-model/project-variable-model';
import ProviderVariableModel from '@/lib/variable-models/managed/resource-model/provider-variable-model';
import RegionVariableModel from '@/lib/variable-models/managed/resource-model/region-variable-model';
import SecretVariableModel from '@/lib/variable-models/managed/resource-model/secret-variable-model';
import ServiceAccountVariableModel from '@/lib/variable-models/managed/resource-model/service-account-variable-model';
import UserVariableModel from '@/lib/variable-models/managed/resource-model/user-variable-model';
import WebhookVariableModel from '@/lib/variable-models/managed/resource-model/webhook-variable-model';
import WorkspaceVariableModel from '@/lib/variable-models/managed/resource-model/workspace-variable-model';


const ENUM_VARIABLE_MODELS: Record<string, new () => IEnumVariableModel> = {
    granularity: GranularityVariableModel,
    cost_default_field: CostDefaultFieldVariableModel,
    cost_default_data_type: CostDefaultDataTypeVariableModel,
    asset_default_field: AssetDefaultFieldVariableModel,
};
const RESOURCE_VARIABLE_MODELS: Record<string, new () => IResourceVariableModel> = {
    cost_data_source: CostDataSourceVariableModel,
    provider: ProviderVariableModel,
    cloud_service_query_set: CloudServiceQuerySetVariableModel,
    cloud_service_type: CloudServiceTypeVariableModel,
    collector: CollectorVariableModel,
    project_group: ProjectGroupVariableModel,
    project: ProjectVariableModel,
    region: RegionVariableModel,
    secret: SecretVariableModel,
    service_account: ServiceAccountVariableModel,
    user: UserVariableModel,
    webhook: WebhookVariableModel,
    workspace: WorkspaceVariableModel,
};
const MANAGED_VARIABLE_MODELS = {
    ...ENUM_VARIABLE_MODELS,
    ...RESOURCE_VARIABLE_MODELS,
};


export type ManagedVariableModelKey = keyof typeof MANAGED_VARIABLE_MODELS;
interface ModelConfig {
    key: ManagedVariableModelKey;
    name: string;
    values?: Value[];
    resourceType?: string;
    idKey?: string;
    referenceKey?: string;
    prefetch?: boolean;
}
export const MANAGED_VARIABLE_MODEL_CONFIGS: Record<ManagedVariableModelKey, ModelConfig> = {} as any;
Object.keys(MANAGED_VARIABLE_MODELS).forEach((key) => {
    const model = new MANAGED_VARIABLE_MODELS[key]();
    Object.defineProperty(MANAGED_VARIABLE_MODEL_CONFIGS, key, {
        configurable: false,
        writable: false,
        value: {
            key: model.key,
            name: model.name,
            values: (model as IEnumVariableModel).values,
            resourceType: (model as IResourceVariableModel).resourceType,
            idKey: (model as IResourceVariableModel).idKey,
            prefetch: model.prefetch,
        },
    });
});



export default MANAGED_VARIABLE_MODELS;
