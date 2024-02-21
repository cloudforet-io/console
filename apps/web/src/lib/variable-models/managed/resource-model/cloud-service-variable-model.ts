import type { CloudServiceModel } from '@/schema/inventory/cloud-service/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';


export default class CloudServiceVariableModel extends ResourceVariableModel<CloudServiceModel> {
    key = 'cloud_service';

    name = 'Cloud Service';

    resourceType = 'inventory.CloudService';

    idKey = 'cloud_service_id';

    // properties
    provider = this.property({ key: 'provider', name: 'Provider' });
}
