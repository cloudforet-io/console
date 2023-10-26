import ResourceNameVariableModel from '@/lib/variable-models/_base/resource-name-variable-model';
import type { VariableModelLabel } from '@/lib/variable-models/_base/types';

export default class ProjectVariableModel extends ResourceNameVariableModel {
    key = 'project';

    name = 'Project';

    labels: VariableModelLabel[] = ['cost', 'asset'];

    resourceType = 'identity.Project';

    idKey = 'project_id';

    #only = ['project_id', 'name', 'project_group_info'];

    formatter(data: any): string {
        return `${data.project_group_info.name} > ${this.nameKey}`;
    }
}
