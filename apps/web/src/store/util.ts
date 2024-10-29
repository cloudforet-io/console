import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';

import { useUserStore } from '@/store/user/user-store';

export const initServiceSettingsStore = <ServiceSettingStates>(service: string): ServiceSettingStates | undefined => {
    const userStore = useUserStore();
    const userId = userStore.state.userId;
    if (userId) {
        const userSettings = LocalStorageAccessor.getItem(userId) ?? {};
        return userSettings[service] || {};
    }
    return undefined;
};
