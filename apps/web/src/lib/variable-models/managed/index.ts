import AssetAccountVariableModel from './asset-account-variable-model';
import CostAdditionalInfoKeyVariableModel from './cost-additional-info-key-variable-model';
import CostDataSourceVariableModel from './cost-data-source-variable-model';
import CostDefaultFieldVariableModel from './cost-default-field-variable-model';
import CostTagKeyVariableModel from './cost-tag-key-variable-model';
import ProviderVariableModel from './provider-variable-model';

export default {
    // enum variable model
    cost_default_field: CostDefaultFieldVariableModel,
    // resource name variable model
    cost_data_source: CostDataSourceVariableModel,
    provider: ProviderVariableModel,
    // resource value variable model
    asset_account: AssetAccountVariableModel,
    // custom resource variable model
    cost_additional_info_keys: CostAdditionalInfoKeyVariableModel,
    cost_tag_keys: CostTagKeyVariableModel,
};
