import ResourceNameVariableModel from '@/lib/variable-models/_base/resource-name-variable-model';
import type { VariableModelLabel } from '@/lib/variable-models/_base/types';

export default class WorkspaceVariableModel extends ResourceNameVariableModel {
    key = 'workspace';

    name = 'Workspace';

    labels: VariableModelLabel[] = ['cost', 'asset'];

    resourceType = 'identity.Workspace';

    idKey = 'workspace_id';
}
