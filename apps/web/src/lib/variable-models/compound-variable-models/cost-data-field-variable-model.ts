import type {
    CompoundVariableModelConfig, CompoundPossibleVariableModel,
} from '@/lib/variable-models/_base/compound-variable-model';
import {
    CompoundVariableModel,
} from '@/lib/variable-models/_base/compound-variable-model';
import { CostGroupByVariableModel } from '@/lib/variable-models/enum-variable-models/cost-group-by-variable-model';
import {
    CostAdditionalInfoKeyVariableModel,
} from '@/lib/variable-models/search-resource-variable-models/extended/cost-additional-info-key-variable-model';
import {
    CostTagKeyVariableModel,
} from '@/lib/variable-models/search-resource-variable-models/extended/cost-tag-key-variable-model';

export class CostDataFieldVariableModel extends CompoundVariableModel {
    constructor(config?: Partial<CompoundVariableModelConfig>) {
        const models: CompoundPossibleVariableModel[] = [
            new CostGroupByVariableModel(),
            new CostAdditionalInfoKeyVariableModel(),
            new CostTagKeyVariableModel(),
        ];
        if (config?.models) {
            models.push(...config.models);
        }
        super({
            ...config,
            key: config?.key ?? 'cost_data_field',
            name: config?.name ?? 'Cost Field',
            models,
        });
    }
}
