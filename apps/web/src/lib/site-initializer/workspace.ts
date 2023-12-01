import { useWorkspaceStore } from '@/store/app-context/workspace/workspace-store';


export const initWorkspace = async () => {
    const workspaceStore = useWorkspaceStore();

    /* Workspace Load */
    await workspaceStore.load();

    /* Set Default Workspace */
    const { pathname } = window.location;
    let workspaceId: string | undefined;
    const workspacePath = pathname?.split('/')[1];
    if (!workspacePath || workspacePath === 'admin') {
        workspaceId = undefined;
    } else workspaceId = workspacePath;
    workspaceStore.setCurrentWorkspace(workspaceId);
};
