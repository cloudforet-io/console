import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { pinia } from '@/store/pinia';


export const initWorkspace = async (userId?: string): Promise<void> => {
    if (!userId) return;
    // NOTE: this is to use pinia store outside vue component
    useAppContextStore(pinia);
    useUserWorkspaceStore(pinia);

    const appContextStore = useAppContextStore();
    const userWorkspaceStore = useUserWorkspaceStore();

    /* Workspace Load */
    await userWorkspaceStore.load();
    const lastAccessedWorkspaceId = await appContextStore.getValidLastAccessedWorkspaceId();

    /* Set Default Workspace */
    const { pathname } = window.location;
    // let workspaceId: string | undefined;
    // const workspacePath = pathname?.split('/')[1];
    // if (workspacePath === 'admin') {
    //     workspaceId = undefined;
    // } else if (workspacePath) {
    //     workspaceId = workspacePath;
    // } else workspaceId = lastAccessedWorkspaceId;
    // userWorkspaceStore.setCurrentWorkspace(workspaceId);
    //
    if (pathname?.split('/')[1] !== 'admin') {
        userWorkspaceStore.setCurrentWorkspace(lastAccessedWorkspaceId);
    }
};
