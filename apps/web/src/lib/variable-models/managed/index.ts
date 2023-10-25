import AssetAccountVariableModel from './asset-account-variable-model';
import CloudServiceQuerySetVariableModel from './cloud-service-query-set-variable-model';
import CloudServiceTypeVariableModel from './cloud-service-type-variable-model';
import CollectorVariableModel from './collector-variable-model';
import CostAdditionalInfoKeyVariableModel from './cost-additional-info-key-variable-model';
import CostDataSourceVariableModel from './cost-data-source-variable-model';
import CostDefaultFieldVariableModel from './cost-default-field-variable-model';
import CostTagKeyVariableModel from './cost-tag-key-variable-model';
import ProjectGroupVariableModel from './project-group-variable-model';
import ProjectVariableModel from './project-variable-model';
import ProviderVariableModel from './provider-variable-model';
import RegionVariableModel from './region-variable-model';
import SecretVariableModel from './secret-variable-model';
import ServiceAccountVariableModel from './service-account-variable-model';
import UserVariableModel from './user-variable-model';
import WebhookVariableModel from './webhook-variable-model';

export default {
    // enum variable model
    cost_default_field: CostDefaultFieldVariableModel,
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
    // custom resource variable model
    cost_additional_info_keys: CostAdditionalInfoKeyVariableModel,
    cost_tag_keys: CostTagKeyVariableModel,
};
