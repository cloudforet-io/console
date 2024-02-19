import ResourceValueVariableModel from '@/lib/variable-models/_base/resource-value-variable-model';

export default class AssetAccountVariableModel extends ResourceValueVariableModel {
    key = 'asset_account';

    name = 'AWS Account ID (Asset)';

    resourceType = 'inventory.CloudService';

    referenceKey = 'account';
}
