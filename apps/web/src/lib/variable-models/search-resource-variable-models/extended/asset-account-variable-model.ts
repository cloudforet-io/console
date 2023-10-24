import type {
    SearchResourceVariableModelConfig,
} from '@/lib/variable-models/_base/search-resource-variable-model';
import { AssetVariableModel } from '@/lib/variable-models/search-resource-variable-models/base/asset-variable-model';

export class AssetAccountVariableModel extends AssetVariableModel {
    constructor(config?: SearchResourceVariableModelConfig) {
        super({
            ...config,
            key: config?.key ?? 'asset_account',
            name: config?.name ?? 'Asset Account',
            referenceKey: 'account',
        });
    }
}
