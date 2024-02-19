import EnumVariableModel from '@/lib/variable-models/_base/enum-variable-model';

export default class CostDefaultDataTypeVariableModel extends EnumVariableModel {
    key = 'cost_default_data_type';

    name = 'Data Type (Cost)';

    values = [
        { key: 'cost', name: 'Cost' },
        { key: 'usage_quantity', name: 'Usage' },
    ];
}
