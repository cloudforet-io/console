import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';

import { store } from '@/store/index';

export const initServiceSettingsStore = <ServiceSettingStates>(service: string): ServiceSettingStates | undefined => {
    const userId = store.state.user.userId;
    if (userId) {
        const userSettings = LocalStorageAccessor.getItem(userId) ?? {};
        return userSettings[service] || {};
    }
    return undefined;
};
