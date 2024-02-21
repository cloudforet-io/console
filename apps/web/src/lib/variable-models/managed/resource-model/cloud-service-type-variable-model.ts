import type { CloudServiceTypeModel } from '@/schema/inventory/cloud-service-type/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';

export default class CloudServiceTypeVariableModel extends ResourceVariableModel<CloudServiceTypeModel> {
    key = 'cloud_service_type';

    name = 'Cloud Service Type';

    resourceType = 'inventory.CloudServiceType';

    idKey = 'cloud_service_type_id';

    _only = ['cloud_service_type_id', 'name', 'group', 'provider', 'tags'];

    _searchTargets = ['cloud_service_type_id', 'name', 'group'];

    nameFormatter(data: any): string {
        return `${data.group} > ${data[this.nameKey]}`;
    }

    // properties
    provider = this.generateProperty({ key: 'provider', name: 'Provider' });
}
