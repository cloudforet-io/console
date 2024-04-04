import EnumVariableModel from '@/lib/variable-models/_base/enum-variable-model';
import type {
    VariableModelLabel,
} from '@/lib/variable-models/_base/types';

export default class AssetDefaultFieldVariableModel extends EnumVariableModel {
    key = 'asset_default_field';

    name = 'Data Field (Cost)';

    labels = ['asset'] as VariableModelLabel[];

    values = [
        // TODO: check if these are the correct values
        { key: 'provider', name: 'Provider' },
        { key: 'project_id', name: 'Project' },
        { key: 'region_code', name: 'Region' },
        { key: 'cloud_service_query_set', name: 'Compliance Framework' },
        { key: 'asset_service', name: 'Service' },
        { key: 'asset_account', name: 'AWS Account ID' },
    ];
}
