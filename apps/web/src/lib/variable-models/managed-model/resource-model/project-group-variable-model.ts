import type { ProjectGroupModel } from '@/api-clients/identity/project-group/schema/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';
import type { VariableModelConstructorConfig } from '@/lib/variable-models/_base/types';


export default class ProjectGroupVariableModel extends ResourceVariableModel<ProjectGroupModel> {
    static meta = {
        key: 'project_group',
        name: 'Project Group',
        resourceType: 'identity.ProjectGroup',
        idKey: 'project_group_id',
        nameKey: 'name',
    };

    constructor(config: VariableModelConstructorConfig = {}) {
        super(config);
        this._meta = ProjectGroupVariableModel.meta;
    }
}
