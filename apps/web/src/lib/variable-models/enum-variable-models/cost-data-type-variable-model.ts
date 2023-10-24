import type { EnumVariableModelConfig } from '@/lib/variable-models/_base/enum-variable-model';
import { EnumVariableModel } from '@/lib/variable-models/_base/enum-variable-model';

export class CostDataTypeVariableModel extends EnumVariableModel {
    constructor(config?: EnumVariableModelConfig) {
        super({
            key: 'cost_data_type_enum',
            name: config?.name ?? 'Cost Data Type',
            labels: ['cost'],
            values: [
                { key: 'cost', name: 'Cost' },
                { key: 'usage_quantity', name: 'Usage' },
            ],
        });
    }
}
