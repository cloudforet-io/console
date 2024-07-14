import type { WorkspaceModel } from '@/schema/identity/workspace/model';

import { WORKSPACE_STATE_COLOR } from '@/services/preference/constants/workspace-constant';

const colorBindFactory = (colorMapping, textFnc) => (value) => ({
    text: textFnc(value),
    ...colorMapping[value],
});

export const workspaceStateFormatter = colorBindFactory(WORKSPACE_STATE_COLOR, (value) => value.toLowerCase());

export const getWorkspaceInfo = (id: string, workspaceList: WorkspaceModel[]): WorkspaceModel|undefined => {
    if (!id) return undefined;
    return workspaceList.find((i) => i.workspace_id === id);
};
