import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';


export const initServiceSettingsStore = <ServiceSettingStates>(service: string, userId?: string): ServiceSettingStates | undefined => {
    if (userId) {
        const userSettings = LocalStorageAccessor.getItem(userId) ?? {};
        return userSettings[service] || {};
    }
    return undefined;
};
