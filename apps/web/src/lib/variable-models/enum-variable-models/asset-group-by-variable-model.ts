import type { EnumVariableModelConfig } from '@/lib/variable-models/_base/enum-variable-model';
import { EnumVariableModel } from '@/lib/variable-models/_base/enum-variable-model';

export class AssetGroupByVariableModel extends EnumVariableModel {
    constructor(config?: EnumVariableModelConfig) {
        super({
            key: 'asset_group_by',
            name: config?.name ?? 'Asset Group By',
            labels: ['asset'],
            values: [
                { key: 'provider', name: 'Provider' },
                { key: 'project_id', name: 'Project' },
                { key: 'region_code', name: 'Region' },
                { key: 'additional_info.service', name: 'Service' },
                { key: 'cloud_service_type', name: 'Compliance Framework' },
                { key: 'account', name: 'AWS Account ID (Asset)' },
            ],
        });
    }
}
