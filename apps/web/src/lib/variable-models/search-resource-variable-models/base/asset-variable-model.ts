import type {
    SearchResourceVariableModelConfig,
} from '@/lib/variable-models/_base/search-resource-variable-model';
import {
    SearchResourceVariableModel,
} from '@/lib/variable-models/_base/search-resource-variable-model';

export class AssetVariableModel extends SearchResourceVariableModel {
    constructor(config?: Omit<SearchResourceVariableModelConfig, 'resourceType'>) {
        super({
            ...config,
            key: config?.key ?? 'asset',
            name: config?.name ?? 'Asset',
            labels: ['asset'],
            resourceType: 'inventory.CloudService',
        });
    }
}
