import ResourceNameVariableModel from '@/lib/variable-models/_base/resource-name-variable-model';
import type { VariableModelLabel } from '@/lib/variable-models/_base/types';

export default class RegionVariableModel extends ResourceNameVariableModel {
    key = 'region';

    name = 'Region';

    labels: VariableModelLabel[] = ['cost', 'asset'];

    resourceType = 'inventory.Region';

    idKey = 'region_code';

    _searchTargets = ['name', 'provider', 'region_code'];

    nameFormatter(data: any): string {
        return `${data[this.nameKey]} | ${data[this.idKey]}`;
    }
}
