import type { CostModel } from '@/schema/cost-analysis/cost/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';


export default class CostVariableModel extends ResourceVariableModel<CostModel> {
    cost_id = this.generateProperty({ key: 'cost_id', name: 'Cost ID' });

    product = this.generateProperty({ key: 'product', name: 'Product', isDataKey: true });

    usage_type = this.generateProperty({ key: 'usage_type', name: 'Usage Type (Cost)', isDataKey: true });

    provider = this.generateProperty({ key: 'provider', name: 'Provider' });

    meta = {
        key: 'cost',
        name: 'Cost',
        resourceType: 'cost_analysis.Cost',
        idKey: 'cost_id',
        nameKey: 'name',
        _properties: [this.cost_id.key, this.product.key, this.usage_type.key, this.provider.key],
    };
}
