import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';

export default class CostVariableModel extends ResourceVariableModel {
    key = 'cost';

    name = 'Cost';

    resourceType = 'cost_analysis.Cost';

    idKey = 'cost_id';

    labelsSchema = {
        product: {
            key: 'product',
            name: 'Product',
            type: 'REFERENCE_KEY',
        },
        usage_type: {
            key: 'usage_type',
            name: 'Usage Type',
            type: 'REFERENCE_KEY',
        },
    };
}
