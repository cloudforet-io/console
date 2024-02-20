import type { WorkspaceModel } from '@/schema/identity/workspace/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';


export default class WorkspaceVariableModel extends ResourceVariableModel<WorkspaceModel> {
    key = 'workspace';

    name = 'Workspace';

    resourceType = 'identity.Workspace';

    idKey = 'workspace_id';
}
