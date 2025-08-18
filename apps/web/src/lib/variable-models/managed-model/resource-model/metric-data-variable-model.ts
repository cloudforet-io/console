import type { MetricDataModel } from '@/api-clients/inventory/metric-data/schema/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';
import type { VariableModelConstructorConfig } from '@/lib/variable-models/_base/types';


export default class MetricDataVariableModel extends ResourceVariableModel<MetricDataModel> {
    static meta = {
        key: 'metric_data',
        name: 'Metric Data',
        resourceType: 'inventory.MetricData',
        idKey: 'metric_id',
        nameKey: 'name',
    };

    constructor(config: VariableModelConstructorConfig = {}) {
        super(config);
        this._meta = MetricDataVariableModel.meta;
    }
}
