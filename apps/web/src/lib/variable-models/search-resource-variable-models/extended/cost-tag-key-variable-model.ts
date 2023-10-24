import type {
    SearchResourceVariableModelConfig,
} from '@/lib/variable-models/_base/search-resource-variable-model';
import {
    CostVariableModel,
} from '@/lib/variable-models/search-resource-variable-models/base/cost-variable-model';

export class CostTagKeyVariableModel extends CostVariableModel {
    constructor(config?: SearchResourceVariableModelConfig) {
        super({
            ...config,
            key: config?.key ?? 'cost_tag_key',
            name: config?.name ?? 'Cost Tags',
            referenceKey: 'tags',
        });
    }
}
