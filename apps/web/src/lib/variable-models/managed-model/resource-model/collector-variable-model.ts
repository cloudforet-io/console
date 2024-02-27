import type { CollectorModel } from '@/schema/inventory/collector/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';
import type { VariableModelConstructorConfig } from '@/lib/variable-models/_base/types';


export default class CollectorVariableModel extends ResourceVariableModel<CollectorModel> {
    provider = this.generateProperty({ key: 'provider', name: 'Provider' });

    static _meta = {
        key: 'collector',
        name: 'Collector',
        resourceType: 'inventory.Collector',
        idKey: 'collector_id',
        nameKey: 'name',
    };

    constructor(config: VariableModelConstructorConfig = {}) {
        super(config);
        this._meta = CollectorVariableModel._meta;
    }
}
