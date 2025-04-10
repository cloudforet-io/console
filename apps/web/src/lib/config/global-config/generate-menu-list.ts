import { useMenuStore } from '@/store/menu/menu-store';

import { getFeatureConfigurator } from '@/lib/config/global-config/helpers/get-feature-configurator';
import type { FeatureSchemaType } from '@/lib/config/global-config/types/type';
import type { Menu } from '@/lib/menu/config';
import { DEFAULT_ADMIN_MENU_LIST, DEFAULT_MENU_LIST } from '@/lib/menu/menu-architecture';

export const generateMenuList = (featureSchema: FeatureSchemaType, mode: string): Menu[] => {
    const menuStore = useMenuStore();
    const menuList: Menu[] = mode === 'admin' ? [] : DEFAULT_MENU_LIST;

    Object.keys(featureSchema).forEach((serviceName) => {
        const configurator = getFeatureConfigurator(serviceName);
        if (configurator) {
            const feature = featureSchema[serviceName];
            const versionSchema = feature[feature.currentVersion];
            configurator.applyUiAffects(versionSchema);
            const serviceMenu = mode === 'admin'
                ? configurator.getAdminMenu(versionSchema)
                : configurator.getWorkspaceMenu(versionSchema);
            if (serviceMenu && !menuList.some((existingRoute) => existingRoute.id === serviceMenu.id)) {
                menuList.push(serviceMenu);
            }
        }
    });

    if (mode === 'admin') {
        menuList.push(...DEFAULT_ADMIN_MENU_LIST);
    }

    menuStore.setMenuList(menuList);
    return menuList;
};
