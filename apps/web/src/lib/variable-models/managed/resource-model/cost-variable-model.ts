import type { CostModel } from '@/schema/cost-analysis/cost/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';


export default class CostVariableModel extends ResourceVariableModel<CostModel> {
    key = 'cost';

    name = 'Cost';

    resourceType = 'cost_analysis.Cost';

    idKey = 'cost_id';

    // properties
    cost_id = this.property({ key: 'cost_id', name: 'Cost ID' });

    product = this.property({ key: 'product', name: 'Product' });

    usage_type = this.property({ key: 'usage_type', name: 'Usage Type' });

    provider = this.property({ key: 'provider', name: 'Provider' });

    // get keys() {
    //     return [this.cost_id.key, this.product.key, this.usage_type.key, this.provider.key];
    // }
}
