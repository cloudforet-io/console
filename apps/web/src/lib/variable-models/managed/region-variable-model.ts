import ResourceNameVariableModel from '@/lib/variable-models/_base/resource-name-variable-model';
import type { VariableModelLabel } from '@/lib/variable-models/_base/types';

export default class RegionVariableModel extends ResourceNameVariableModel {
    key = 'region';

    name = 'Region';

    labels: VariableModelLabel[] = ['cost', 'asset'];

    resourceType = 'inventory.Region';

    idKey = 'region_code';

    #searchTargets = ['name', 'provider', 'region_code'];

    formatter(data: any): string {
        return `[${data.provider}] ${this.nameKey} | ${this.idKey}`;
    }
}
