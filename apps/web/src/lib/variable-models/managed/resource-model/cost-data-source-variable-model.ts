import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';

export default class CostDataSourceVariableModel extends ResourceVariableModel {
    key = 'cost_data_source';

    name = 'Data Source';

    resourceType = 'cost_analysis.DataSource';

    idKey = 'data_source_id';
}
