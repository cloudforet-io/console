import EnumVariableModel from '@/lib/variable-models/_base/enum-variable-model';
import type { VariableModelConstructorConfig } from '@/lib/variable-models/_base/types';


export default class CostDefaultDataTypeVariableModel extends EnumVariableModel {
    static _meta = {
        key: 'cost_default_data_type',
        name: 'Data Type (Cost)',
    };

    values = [
        { key: 'cost', name: 'Cost' },
        { key: 'usage_quantity', name: 'Usage' },
    ];

    constructor(config: VariableModelConstructorConfig = {}) {
        super(config);
        this._meta = CostDefaultDataTypeVariableModel._meta;
    }
}
