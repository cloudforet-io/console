import { useAppContextStore } from '@/store/app-context/app-context-store';
import { pinia } from '@/store/pinia';

import featureSchemaManager from '@/lib/config/global-config/feature-schema-manager';
import { generateMenuList } from '@/lib/config/global-config/generate-menu-list';

export const initModeSetting = () => {
    // NOTE: this is to use pinia store outside vue component
    useAppContextStore(pinia);

    const appContextStore = useAppContextStore();
    const schema = featureSchemaManager.getFeatureSchema();

    const { pathname } = window.location;
    const modePath = pathname?.split('/')[1];
    if (modePath === 'admin') {
        appContextStore.enterAdminMode();
    }
    generateMenuList(schema, modePath === 'admin' ? 'admin' : 'workspace');
};
