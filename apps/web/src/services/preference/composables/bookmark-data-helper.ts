import type { WorkspaceModel } from '@/schema/identity/workspace/model';

export const getWorkspaceInfo = (id: string, workspaceList: WorkspaceModel[]): WorkspaceModel|undefined => {
    if (!id) return undefined;
    return workspaceList.find((i) => i.workspace_id === id);
};
