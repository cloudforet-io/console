import EnumVariableModel from '@/lib/variable-models/_base/enum-variable-model';

export default class CostDefaultFieldVariableModel extends EnumVariableModel {
    meta = {
        key: 'cost_default_field',
        name: 'Data Field (Cost)',
    };

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
