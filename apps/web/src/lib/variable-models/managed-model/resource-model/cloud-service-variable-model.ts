import type { CloudServiceModel } from '@/api-clients/inventory/cloud-service/schema/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';
import type { VariableModelConstructorConfig } from '@/lib/variable-models/_base/types';


export default class CloudServiceVariableModel extends ResourceVariableModel<CloudServiceModel> {
    provider = this.generateProperty({ key: 'provider', name: 'Provider' });

    account = this.generateProperty({ key: 'account', name: 'Asset Account' });

    static meta = {
        key: 'cloud_service',
        name: 'Cloud Service',
        resourceType: 'inventory.CloudService',
        idKey: 'cloud_service_id',
        nameKey: 'name',
        _only: ['cloud_service_id', 'name', 'provider', 'cloud_service_group', 'cloud_service_type', 'reference.resource_id', 'ip_addresses'],
        _searchTargets: ['name', 'reference.resource_id', 'ip_addresses'],
    };

    nameFormatter(data): string {
        const name: string|undefined = data[this._meta.nameKey];
        const resourceId: string = data.reference?.resource_id; // resourceId is always exist
        return name ? `${name} (${resourceId})` : resourceId;
    }

    constructor(config: VariableModelConstructorConfig = {}) {
        super(config);
        this._meta = CloudServiceVariableModel.meta;
    }
}
