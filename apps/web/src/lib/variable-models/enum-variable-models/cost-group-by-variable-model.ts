import type { EnumVariableModelConfig } from '@/lib/variable-models/_base/enum-variable-model';
import { EnumVariableModel } from '@/lib/variable-models/_base/enum-variable-model';

export class CostGroupByVariableModel extends EnumVariableModel {
    constructor(config?: EnumVariableModelConfig) {
        super({
            key: 'cost_group_by_enum',
            name: config?.name ?? 'Cost Group By',
            labels: ['cost'],
            values: [
                { key: 'provider', name: 'Provider' },
                { key: 'project_id', name: 'Project' },
                { key: 'service_account_id', name: 'Service Account' },
                { key: 'project_group_id', name: 'Project Group' },
                { key: 'region_code', name: 'Region' },
                { key: 'cost_usage_type', name: 'Usage Type' },
                { key: 'cost_product', name: 'Product' },
            ],
        });
    }
}
