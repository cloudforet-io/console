import { pinia } from '@/store/pinia';

import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';


export const initTaskManagementTemplate = async () => {
    const taskManagementTemplateStore = useTaskManagementTemplateStore(pinia);
    await Promise.allSettled([
        taskManagementTemplateStore.setInitialTemplateId(),
        taskManagementTemplateStore.setInitialLandingData(),
    ]);
};
