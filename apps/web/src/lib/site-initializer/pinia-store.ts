import { createPinia } from 'pinia';

import { useWorkspaceStore } from '@/store/app-context/workspace/workspace-store';
import { resetStore } from '@/store/reset-pinia-store';

export const pinia = createPinia();
export const initPiniaStore = () => {
    pinia.use(resetStore);
    useWorkspaceStore(pinia);
};
