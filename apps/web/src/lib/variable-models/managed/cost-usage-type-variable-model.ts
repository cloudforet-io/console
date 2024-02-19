import ResourceValueVariableModel from '@/lib/variable-models/_base/resource-value-variable-model';

export default class CostUsageTypeVariableModel extends ResourceValueVariableModel {
    key = 'cost_usage_type';

    name = 'Usage Type (Cost)';

    resourceType = 'cost_analysis.Cost';

    referenceKey = 'usage_type';

    prefetch = true;
}
