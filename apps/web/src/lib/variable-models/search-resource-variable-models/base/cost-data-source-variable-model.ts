import type {
    SearchResourceVariableModelConfig,
} from '@/lib/variable-models/_base/search-resource-variable-model';
import {
    SearchResourceVariableModel,
} from '@/lib/variable-models/_base/search-resource-variable-model';

export class CostDataSourceVariableModel extends SearchResourceVariableModel {
    constructor(config?: Omit<SearchResourceVariableModelConfig, 'resourceType'>) {
        super({
            ...config,
            key: config?.key ?? 'cost_data_source',
            name: config?.name ?? 'Cost Data Source',
            labels: ['cost'],
            resourceType: 'cost_analysis.DataSource',
        });
    }
}
