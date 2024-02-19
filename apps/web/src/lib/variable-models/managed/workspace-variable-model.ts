import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';

export default class WorkspaceVariableModel extends ResourceVariableModel {
    key = 'workspace';

    name = 'Workspace';

    resourceType = 'identity.Workspace';

    idKey = 'workspace_id';
}
