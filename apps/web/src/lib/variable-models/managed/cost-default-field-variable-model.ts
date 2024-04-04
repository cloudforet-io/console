import EnumVariableModel from '@/lib/variable-models/_base/enum-variable-model';
import type {
    VariableModelLabel,
} from '@/lib/variable-models/_base/types';

export default class CostDefaultFieldVariableModel extends EnumVariableModel {
    key = 'cost_default_field';

    name = 'Data Field (Cost)';

    labels = ['cost'] as VariableModelLabel[];

    values = [
        { key: 'provider', name: 'Provider' },
        { key: 'project_id', name: 'Project' },
        { key: 'service_account_id', name: 'Service Account' },
        { key: 'project_group_id', name: 'Project Group' },
        { key: 'region_code', name: 'Region' },
        { key: 'usage_type', name: 'Usage Type Details' },
        { key: 'product', name: 'Product' },
    ];
}
