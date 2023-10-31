import EnumVariableModel from '@/lib/variable-models/_base/enum-variable-model';
import type {
    VariableModelLabel,
} from '@/lib/variable-models/_base/types';

export default class CostDefaultDataTypeVariableModel extends EnumVariableModel {
    key = 'cost_default_data_type';

    name = 'Data Type (Cost)';

    labels = ['cost'] as VariableModelLabel[];

    values = [
        { key: 'cost', name: 'Cost' },
        { key: 'usage', name: 'Usage' },
    ];
}
