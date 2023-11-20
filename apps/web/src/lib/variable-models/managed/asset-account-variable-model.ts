import ResourceValueVariableModel from '@/lib/variable-models/_base/resource-value-variable-model';
import type { VariableModelLabel } from '@/lib/variable-models/_base/types';

export default class AssetAccountVariableModel extends ResourceValueVariableModel {
    key = 'asset_account';

    name = 'AWS Account ID (Asset)';

    labels: VariableModelLabel[] = ['asset'];

    resourceType = 'inventory.CloudService';

    referenceKey = 'account';
}
