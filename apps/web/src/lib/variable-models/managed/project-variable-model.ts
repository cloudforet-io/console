import ResourceNameVariableModel from '@/lib/variable-models/_base/resource-name-variable-model';
import type { VariableModelLabel } from '@/lib/variable-models/_base/types';

export default class ProjectVariableModel extends ResourceNameVariableModel {
    key = 'project';

    name = 'Project';

    labels: VariableModelLabel[] = ['cost', 'asset'];

    resourceType = 'identity.Project';

    idKey = 'project_id';

    _only = ['project_id', 'name', 'project_group_info'];

    nameFormatter(data: any): string {
        if (data.project_group_info?.name) {
            return `${data.project_group_info.name} > ${data[this.nameKey]}`;
        }
        return data[this.nameKey];
    }
}
