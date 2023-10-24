import { ResourceFieldVariableModel } from '@/lib/variable-models/_base/resource-field-variable-model';
import type { VariableModelLabel } from '@/lib/variable-models/_base/types';

export class CostDataSourceVariableModel extends ResourceFieldVariableModel {
    key = 'cost_data_source';

    name = 'Cost Data Source';

    labels: VariableModelLabel[] = ['cost'];

    resourceType = 'cost_analysis.DataSource';

    resourceId = 'data_source_id';

    only = ['data_source_id', 'name'];

    searchTargets = ['name'];

    // eslint-disable-next-line class-methods-use-this
    formatter(data: any) {
        return data.name;
    }
}
