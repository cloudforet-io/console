import ResourceNameVariableModel from '@/lib/variable-models/_base/resource-name-variable-model';

export default class CostDataSourceVariableModel extends ResourceNameVariableModel {
    key = 'cost_data_source';

    name = 'Data Source';

    resourceType = 'cost_analysis.DataSource';

    idKey = 'data_source_id';
}
