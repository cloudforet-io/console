import ResourceNameVariableModel from '@/lib/variable-models/_base/resource-name-variable-model';
import type { VariableModelLabel } from '@/lib/variable-models/_base/types';

export default class ProjectGroupVariableModel extends ResourceNameVariableModel {
    key = 'project_group';

    name = 'Project Group';

    labels: VariableModelLabel[] = ['cost'];

    resourceType = 'identity.ProjectGroup';

    idKey = 'project_group_id';
}
