import type { CollectorModel } from '@/schema/inventory/collector/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';


export default class CollectorVariableModel extends ResourceVariableModel<CollectorModel> {
    key = 'collector';

    name = 'Collector';

    resourceType = 'inventory.Collector';

    idKey = 'collector_id';

    // properties
    provider = this.generateProperty({ key: 'provider', name: 'Provider' });
}
