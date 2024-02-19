import ResourceNameVariableModel from '@/lib/variable-models/_base/resource-name-variable-model';

export default class ProjectGroupVariableModel extends ResourceNameVariableModel {
    key = 'project_group';

    name = 'Project Group';

    resourceType = 'identity.ProjectGroup';

    idKey = 'project_group_id';
}
