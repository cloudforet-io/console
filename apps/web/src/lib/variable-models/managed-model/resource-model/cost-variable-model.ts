import type { CostModel } from '@/schema/cost-analysis/cost/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';
import type { VariableModelConstructorConfig } from '@/lib/variable-models/_base/types';


export default class CostVariableModel extends ResourceVariableModel<CostModel> {
    cost_id = this.generateProperty({ key: 'cost_id', name: 'Cost ID' });

    product = this.generateProperty({ key: 'product', name: 'Product' });

    usage_type = this.generateProperty({ key: 'usage_type', name: 'Usage Type (Cost)' });

    provider = this.generateProperty({ key: 'provider', name: 'Provider' });

    static meta = {
        key: 'cost',
        name: 'Cost',
        resourceType: 'cost_analysis.Cost',
        idKey: 'cost_id',
        nameKey: 'name',
    };

    constructor(config: VariableModelConstructorConfig = {}) {
        super(config);
        this._meta = CostVariableModel.meta;
    }
}
