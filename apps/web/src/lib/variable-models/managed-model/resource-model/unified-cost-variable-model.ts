
import type { UnifiedCostModel } from '@/api-clients/cost-analysis/unified-cost/schema/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';
import type { VariableModelConstructorConfig } from '@/lib/variable-models/_base/types';


export default class UnifiedCostVariableModel extends ResourceVariableModel<UnifiedCostModel> {
    unified_cost_id = this.generateProperty({ key: 'unified_cost_id', name: 'Unified Cost ID' });

    product = this.generateProperty({ key: 'product', name: 'Product' });

    usage_type = this.generateProperty({ key: 'usage_type', name: 'Usage Type (Unified Cost)' });

    provider = this.generateProperty({ key: 'provider', name: 'Provider' });

    region = this.generateProperty({ key: 'region_code', name: 'Region' });

    static meta = {
        key: 'unified_cost',
        name: 'Unified Cost',
        resourceType: 'cost_analysis.UnifiedCost',
        idKey: 'unified_cost_id',
        nameKey: 'name',
    };

    constructor(config: VariableModelConstructorConfig = {}) {
        super(config);
        this._meta = UnifiedCostVariableModel.meta;
    }
}
