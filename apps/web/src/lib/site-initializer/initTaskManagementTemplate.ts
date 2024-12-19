import { pinia } from '@/store/pinia';
import { useUserStore } from '@/store/user/user-store';

import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';

export const initTaskManagementTemplate = async () => {
    const userStore = useUserStore(pinia);
    if (userStore.state.isSessionExpired) return;

    const taskManagementTemplateStore = useTaskManagementTemplateStore(pinia);
    await Promise.allSettled([
        taskManagementTemplateStore.setInitialTemplateId(),
        taskManagementTemplateStore.setInitialLandingData(),
    ]);
};
