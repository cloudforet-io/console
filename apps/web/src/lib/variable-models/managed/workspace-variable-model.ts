import ResourceNameVariableModel from '@/lib/variable-models/_base/resource-name-variable-model';

export default class WorkspaceVariableModel extends ResourceNameVariableModel {
    key = 'workspace';

    name = 'Workspace';

    resourceType = 'identity.Workspace';

    idKey = 'workspace_id';
}
