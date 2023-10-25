import ResourceNameVariableModel from '@/lib/variable-models/_base/resource-name-variable-model';
import type { VariableModelLabel } from '@/lib/variable-models/_base/types';

export default class CostDataSourceVariableModel extends ResourceNameVariableModel {
    key = 'cost_data_source';

    name = 'Cost Data Source';

    labels: VariableModelLabel[] = ['cost'];

    resourceType = 'cost_analysis.DataSource';

    idKey = 'data_source_id';
}
