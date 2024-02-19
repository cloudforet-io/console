import ResourceValueVariableModel from '@/lib/variable-models/_base/resource-value-variable-model';

export default class CostProductVariableModel extends ResourceValueVariableModel {
    key = 'cost_product';

    name = 'Product (Cost)';

    resourceType = 'cost_analysis.Cost';

    referenceKey = 'product';

    prefetch = true;
}
