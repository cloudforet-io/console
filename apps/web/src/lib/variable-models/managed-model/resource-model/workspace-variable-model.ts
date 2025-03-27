import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';
import type { VariableModelConstructorConfig } from '@/lib/variable-models/_base/types';


export default class WorkspaceVariableModel extends ResourceVariableModel<WorkspaceModel> {
    static meta = {
        key: 'workspace',
        name: 'Workspace',
        resourceType: 'identity.Workspace',
        idKey: 'workspace_id',
        nameKey: 'name',
        _searchTargets: ['name'],
    };

    constructor(config: VariableModelConstructorConfig = {}) {
        super(config);
        this._meta = WorkspaceVariableModel.meta;
    }
}
