import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { pinia } from '@/store/pinia';


export const initWorkspace = async (userId): Promise<string|undefined> => {
    // NOTE: this is to use pinia store outside vue component
    useUserWorkspaceStore(pinia);

    const workspaceStore = useUserWorkspaceStore();

    /* Workspace Load */
    await workspaceStore.load(userId);

    /* Set Default Workspace */
    const { pathname } = window.location;
    let workspaceId: string | undefined;
    const workspacePath = pathname?.split('/')[1];
    if (!workspacePath || workspacePath === 'admin') {
        workspaceId = undefined;
    } else workspaceId = workspacePath;

    workspaceStore.setCurrentWorkspace(workspaceId);

    return workspaceStore.getters.currentWorkspaceId;
};
