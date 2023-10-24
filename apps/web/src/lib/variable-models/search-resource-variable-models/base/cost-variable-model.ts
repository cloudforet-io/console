import type {
    SearchResourceVariableModelConfig,
} from '@/lib/variable-models/_base/search-resource-variable-model';
import {
    SearchResourceVariableModel,
} from '@/lib/variable-models/_base/search-resource-variable-model';

export class CostVariableModel extends SearchResourceVariableModel {
    constructor(config?: Omit<SearchResourceVariableModelConfig, 'resourceType'>) {
        super({
            ...config,
            key: config?.key ?? 'cost_analysis',
            name: config?.name ?? 'Cost',
            labels: ['cost'],
            resourceType: 'cost_analysis.Cost',
        });
    }
}
