import ResourceNameVariableModel from '@/lib/variable-models/_base/resource-name-variable-model';

export default class RegionVariableModel extends ResourceNameVariableModel {
    key = 'region';

    name = 'Region';

    resourceType = 'inventory.Region';

    idKey = 'region_code';

    _searchTargets = ['name', 'provider', 'region_code'];

    nameFormatter(data: any): string {
        return `${data[this.nameKey]} | ${data[this.idKey]}`;
    }
}
