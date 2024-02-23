import type { RegionModel } from '@/schema/inventory/region/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';


export default class RegionVariableModel extends ResourceVariableModel<RegionModel> {
    provider = this.generateProperty({ key: 'provider', name: 'Provider' });

    static meta = {
        key: 'region',
        name: 'Region',
        resourceType: 'inventory.Region',
        idKey: 'region_code',
        nameKey: 'name',
        _searchTargets: ['name', 'provider', 'region_code'],
    };

    _properties = [this.provider.key];

    nameFormatter(data: any): string {
        return `${data[this.meta.nameKey]} | ${data[this.meta.idKey]}`;
    }
}
