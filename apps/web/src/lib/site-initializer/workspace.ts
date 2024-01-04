import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { getLastAccessedWorkspaceId } from '@/store/modules/user/actions';
import { pinia } from '@/store/pinia';


export const initWorkspace = async (userId?: string): Promise<string|undefined> => {
    // NOTE: this is to use pinia store outside vue component
    useUserWorkspaceStore(pinia);

    const workspaceStore = useUserWorkspaceStore();

    /* Workspace Load */
    await workspaceStore.load(userId);
    const lastAccessedWorkspaceId = userId ? await getLastAccessedWorkspaceId() : undefined;

    /* Set Default Workspace */
    const { pathname } = window.location;
    let workspaceId: string | undefined;
    const workspacePath = pathname?.split('/')[1];
    if (workspacePath === 'admin') {
        workspaceId = undefined;
    } else if (workspacePath) {
        workspaceId = workspacePath;
    } else workspaceId = lastAccessedWorkspaceId;
    workspaceStore.setCurrentWorkspace(workspaceId);

    return workspaceStore.getters.currentWorkspaceId;
};
