import EnumVariableModel from '@/lib/variable-models/_base/enum-variable-model';

export default class AssetDefaultFieldVariableModel extends EnumVariableModel {
    key = 'asset_default_field';

    name = 'Data Field (Cost)';

    values = [
        { key: 'provider', name: 'Provider' },
        { key: 'project_id', name: 'Project' },
        { key: 'region_code', name: 'Region' },
        { key: 'cloud_service_query_set', name: 'Compliance Framework' },
        { key: 'asset_service', name: 'Service' },
        { key: 'asset_account', name: 'AWS Account ID' },
    ];
}
