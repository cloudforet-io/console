import type { CostDataSourceModel } from '@/schema/cost-analysis/data-source/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';
import type { VariableModelConstructorConfig } from '@/lib/variable-models/_base/types';


export default class CostDataSourceVariableModel extends ResourceVariableModel<CostDataSourceModel> {
    provider = this.generateProperty({ key: 'provider', name: 'Provider' });

    static meta = {
        key: 'cost_data_source',
        name: 'Data Source',
        resourceType: 'cost_analysis.DataSource',
        idKey: 'data_source_id',
        nameKey: 'name',
        _searchTargets: ['name'],
    };

    constructor(config: VariableModelConstructorConfig = {}) {
        super(config);
        this._meta = CostDataSourceVariableModel.meta;
    }
}
