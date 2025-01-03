import { computed } from 'vue';

import type { DisplayMenu } from '@/store/display/type';
import { useDomainStore } from '@/store/domain/domain-store';

import config from '@/lib/config';
import { MENU_ID } from '@/lib/menu/config';

import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';

const ADVANCED_SERVICE_NAMES: string[] = [MENU_ID.OPS_FLOW];
export const useAdvancedMenuDisplay = () => {
    const domainStore = useDomainStore();
    const taskManagementTemplateStore = useTaskManagementTemplateStore();

    const isMenuDisplayable = (menuId: string, domainId: string): boolean => {
        if (!ADVANCED_SERVICE_NAMES.includes(menuId)) return true;
        const advanceService: Record<string, string[]>|undefined = config.get('ADVANCED_SERVICE');
        return !!advanceService?.[menuId]?.includes(domainId);
    };
    const availableAdvancedServices = computed(() => ({
        [MENU_ID.OPS_FLOW]: isMenuDisplayable(MENU_ID.OPS_FLOW, domainStore.state.domainId),
    }));

    const refineOpsflowSubMenu = (menu: DisplayMenu): DisplayMenu[]|undefined => {
        const sub = menu.subMenuList;
        if (!sub) return undefined;
        const refined: DisplayMenu[] = sub.map((s) => {
            if (s.id === MENU_ID.OPS_FLOW_LANDING) {
                const label = taskManagementTemplateStore.templates.TemplateName;
                const hideOnGNB = taskManagementTemplateStore.state.templateId === 'default' || !taskManagementTemplateStore.state.enableLanding;
                const hideOnSiteMap = taskManagementTemplateStore.state.templateId === 'default' || !taskManagementTemplateStore.state.enableLanding;
                return {
                    ...s,
                    label,
                    hideOnGNB,
                    hideOnSiteMap,
                };
            }
            if (s.id === MENU_ID.TASK_BOARD) {
                const label = taskManagementTemplateStore.templates.TaskBoard;
                return { ...s, label };
            }
            return s;
        });

        return refined;
    };

    const refineGNBMenuList = (allGNBMenuList: DisplayMenu[]): DisplayMenu[] => allGNBMenuList.filter((menu) => isMenuDisplayable(menu.id, domainStore.state.domainId)).map((menu) => {
        if (menu.id === MENU_ID.OPS_FLOW) {
            return {
                ...menu,
                subMenuList: refineOpsflowSubMenu(menu),
            };
        }
        return menu;
    });
    return {
        availableAdvancedServices,
        refineGNBMenuList,
    };
};
