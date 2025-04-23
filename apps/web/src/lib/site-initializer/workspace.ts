import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { pinia } from '@/store/pinia';

import { getLastAccessedWorkspaceId } from '@/lib/site-initializer/last-accessed-workspace';

const USER_PAGE_FIRST_PATH_LIST = ['admin', 'my-page', 'landing'];
export const initWorkspace = async (userId?: string): Promise<void> => {
    if (!userId) return;
    // NOTE: this is to use pinia store outside vue component
    useUserWorkspaceStore(pinia);

    const userWorkspaceStore = useUserWorkspaceStore();

    /* Workspace Load */
    await userWorkspaceStore.load();
    const lastAccessedWorkspaceId = await getLastAccessedWorkspaceId();

    /* Set Default Workspace */
    const { pathname } = window.location;

    if (!USER_PAGE_FIRST_PATH_LIST.includes(pathname?.split('/')[1])) {
        userWorkspaceStore.setCurrentWorkspace(lastAccessedWorkspaceId);
    } else {
        userWorkspaceStore.setCurrentWorkspace();
    }
};
