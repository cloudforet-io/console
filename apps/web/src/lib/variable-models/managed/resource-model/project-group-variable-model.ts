import type { ProjectGroupModel } from '@/schema/identity/project-group/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';


export default class ProjectGroupVariableModel extends ResourceVariableModel<ProjectGroupModel> {
    key = 'project_group';

    name = 'Project Group';

    resourceType = 'identity.ProjectGroup';

    idKey = 'project_group_id';
}
