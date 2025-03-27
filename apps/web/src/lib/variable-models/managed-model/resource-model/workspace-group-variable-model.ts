import type { WorkspaceGroupModel } from '@/api-clients/identity/workspace-group/schema/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';
import type { VariableModelConstructorConfig } from '@/lib/variable-models/_base/types';


export default class WorkspaceGroupVariableModel extends ResourceVariableModel<WorkspaceGroupModel> {
    static meta = {
        key: 'workspace_group',
        name: 'Workspace_group',
        resourceType: 'identity.WorkspaceGroup',
        idKey: 'workspace_group_id',
        nameKey: 'name',
        _searchTargets: ['name'],
    };

    constructor(config: VariableModelConstructorConfig = {}) {
        super(config);
        this._meta = WorkspaceGroupVariableModel.meta;
    }
}
