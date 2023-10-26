import ResourceValueVariableModel from '@/lib/variable-models/_base/resource-value-variable-model';
import type { VariableModelLabel } from '@/lib/variable-models/_base/types';

export default class CostProductVariableModel extends ResourceValueVariableModel {
    key = 'cost_product';

    name = 'Product (Cost)';

    labels: VariableModelLabel[] = ['cost'];

    resourceType = 'cost_analysis.Cost';

    referenceKey = 'product';
}
