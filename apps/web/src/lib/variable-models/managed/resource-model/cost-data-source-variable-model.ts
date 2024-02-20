import type { CostDataSourceModel } from '@/schema/cost-analysis/data-source/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';


export default class CostDataSourceVariableModel extends ResourceVariableModel<CostDataSourceModel> {
    key = 'cost_data_source';

    name = 'Data Source';

    resourceType = 'cost_analysis.DataSource';

    idKey = 'data_source_id';

    // properties
    provider = this.property({ key: 'provider', name: 'Provider' });
}
