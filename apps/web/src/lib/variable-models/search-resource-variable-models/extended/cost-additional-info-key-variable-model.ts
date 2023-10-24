import type {
    SearchResourceVariableModelConfig,
} from '@/lib/variable-models/_base/search-resource-variable-model';
import { CostVariableModel } from '@/lib/variable-models/search-resource-variable-models/base/cost-variable-model';

export class CostAdditionalInfoKeyVariableModel extends CostVariableModel {
    constructor(config?: SearchResourceVariableModelConfig) {
        super({
            ...config,
            key: config?.key ?? 'cost_additional_info_key',
            referenceKey: 'additional_info',
        });
    }
}
