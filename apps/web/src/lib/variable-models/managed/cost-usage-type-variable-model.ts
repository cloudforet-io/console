import ResourceValueVariableModel from '@/lib/variable-models/_base/resource-value-variable-model';
import type { VariableModelLabel } from '@/lib/variable-models/_base/types';

export default class CostUsageTypeVariableModel extends ResourceValueVariableModel {
    key = 'cost_usage_type';

    name = 'Usage Type (Cost)';

    labels: VariableModelLabel[] = ['cost'];

    resourceType = 'cost_analysis.Cost';

    referenceKey = 'usage_type';
}
