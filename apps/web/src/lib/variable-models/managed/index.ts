import type { VariableModelLabel } from '@/lib/variable-models/_base/types';
import CostDefaultDataTypeVariableModel from '@/lib/variable-models/managed/cost-default-data-type-variable-model';
import CostUsageTypeVariableModel from '@/lib/variable-models/managed/cost-usage-type-variable-model';

import AssetAccountVariableModel from './asset-account-variable-model';
import CloudServiceQuerySetDataKeyVariableModel from './cloud-service-query-set-data-key-variable-model';
import CloudServiceQuerySetVariableModel from './cloud-service-query-set-variable-model';
import CloudServiceTypeVariableModel from './cloud-service-type-variable-model';
import CollectorVariableModel from './collector-variable-model';
import CostAdditionalInfoKeyVariableModel from './cost-additional-info-key-variable-model';
import CostDataSourceDataKeyVariableModel from './cost-data-source-data-key-variable-model';
import CostDataSourceVariableModel from './cost-data-source-variable-model';
import CostDefaultFieldVariableModel from './cost-default-field-variable-model';
import CostProductVariableModel from './cost-product-variable-model';
import CostTagKeyVariableModel from './cost-tag-key-variable-model';
import ProjectGroupVariableModel from './project-group-variable-model';
import ProjectVariableModel from './project-variable-model';
import ProviderVariableModel from './provider-variable-model';
import RegionVariableModel from './region-variable-model';
import SecretVariableModel from './secret-variable-model';
import ServiceAccountVariableModel from './service-account-variable-model';
import UserVariableModel from './user-variable-model';
import WebhookVariableModel from './webhook-variable-model';

const MANAGED_VARIABLE_MODELS = {
    // enum variable model
    cost_default_field: CostDefaultFieldVariableModel,
    cost_default_data_type: CostDefaultDataTypeVariableModel,
    // resource name variable model
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
    // resource value variable model
    asset_account: AssetAccountVariableModel,
    cost_product: CostProductVariableModel,
    cost_usage_type: CostUsageTypeVariableModel,
    // custom resource variable model
    cost_additional_info_key: CostAdditionalInfoKeyVariableModel,
    cost_tag_key: CostTagKeyVariableModel,
    cost_data_source_data_key: CostDataSourceDataKeyVariableModel,
    cloud_service_query_set_data_key: CloudServiceQuerySetDataKeyVariableModel,
};

export type ManagedVariableModelKey = keyof typeof MANAGED_VARIABLE_MODELS;
interface ManagedVariableModelConfig {
    key: ManagedVariableModelKey;
    name: string;
    labels: VariableModelLabel[];
}
export const MANAGED_VARIABLE_MODEL_CONFIGS: Record<ManagedVariableModelKey, ManagedVariableModelConfig> = {} as any;
Object.keys(MANAGED_VARIABLE_MODELS).forEach((key) => {
    const model = new MANAGED_VARIABLE_MODELS[key]();
    Object.defineProperty(MANAGED_VARIABLE_MODEL_CONFIGS, key, {
        configurable: false,
        writable: false,
        value: {
            key: model.key,
            name: model.name,
            labels: model.labels,
        },
    });
});



export default MANAGED_VARIABLE_MODELS;
