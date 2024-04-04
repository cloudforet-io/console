import ResourceNameVariableModel from '@/lib/variable-models/_base/resource-name-variable-model';
import type { VariableModelLabel } from '@/lib/variable-models/_base/types';

export default class CloudServiceTypeVariableModel extends ResourceNameVariableModel {
    key = 'cloud_service_type';

    name = 'Cloud Service Type';

    labels: VariableModelLabel[] = [];

    resourceType = 'inventory.CloudServiceType';

    idKey = 'cloud_service_type_id';

    _only = ['cloud_service_type_id', 'name', 'group', 'provider', 'tags'];

    _searchTargets = ['cloud_service_type_id', 'name', 'group'];

    nameFormatter(data: any): string {
        return `${data.group} > ${data[this.nameKey]}`;
    }
}
