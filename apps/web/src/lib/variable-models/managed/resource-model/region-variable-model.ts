import type { RegionModel } from '@/schema/inventory/region/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';


export default class RegionVariableModel extends ResourceVariableModel<RegionModel> {
    key = 'region';

    name = 'Region';

    resourceType = 'inventory.Region';

    idKey = 'region_code';

    _searchTargets = ['name', 'provider', 'region_code'];

    nameFormatter(data: any): string {
        return `${data[this.nameKey]} | ${data[this.idKey]}`;
    }

    // properties
    provider = this.generateProperty({ key: 'provider', name: 'Provider' });
}
