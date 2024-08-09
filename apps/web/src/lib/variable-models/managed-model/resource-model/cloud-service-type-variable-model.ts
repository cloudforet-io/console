import type { CloudServiceTypeModel } from '@/schema/inventory/cloud-service-type/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';
import type { VariableModelConstructorConfig } from '@/lib/variable-models/_base/types';


export default class CloudServiceTypeVariableModel extends ResourceVariableModel<CloudServiceTypeModel> {
    provider = this.generateProperty({ key: 'provider', name: 'Provider' });

    static meta = {
        key: 'cloud_service_type',
        name: 'Cloud Service Type',
        resourceType: 'inventory.CloudServiceType',
        idKey: 'cloud_service_type_id',
        nameKey: 'name',
        _only: ['cloud_service_type_id', 'name', 'group', 'provider', 'tags'],
        _searchTargets: ['cloud_service_type_id', 'name', 'group'],
    };

    constructor(config: VariableModelConstructorConfig = {}) {
        super(config);
        this._meta = CloudServiceTypeVariableModel.meta;
    }

    nameFormatter(data: any): string {
        return `${data.group} > ${data[this._meta.nameKey]}`;
    }
}
