import { AssetAccountVariableModel } from '@/lib/variable-models/managed/asset-account-variable-model';
import { CostDataFieldVariableModel } from '@/lib/variable-models/managed/cost-data-field-variable-model';
import { CostDataSourceVariableModel } from '@/lib/variable-models/managed/cost-data-source-variable-model';
import { ProviderVariableModel } from '@/lib/variable-models/managed/provider-variable-model';

export default {
    // resource field
    cost_data_source: CostDataSourceVariableModel,
    provider: ProviderVariableModel,
    // resource value
    asset_account: AssetAccountVariableModel,
    // compound
    cost_data_field: CostDataFieldVariableModel,
};
