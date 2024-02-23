import type { CollectorModel } from '@/schema/inventory/collector/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';


export default class CollectorVariableModel extends ResourceVariableModel<CollectorModel> {
    provider = this.generateProperty({ key: 'provider', name: 'Provider' });

    static meta = {
        key: 'collector',
        name: 'Collector',
        resourceType: 'inventory.Collector',
        idKey: 'collector_id',
        nameKey: 'name',
    };

    get properties() {
        return [this.provider.key];
    }
}
