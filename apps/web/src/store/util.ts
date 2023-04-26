import { store } from '@/store/index';

export const initServiceSettingsStore = <ServiceSettingStates>(service: string): ServiceSettingStates | undefined => {
    const userId = store.state.user.userId;
    if (userId) {
        const userSettings = JSON.parse(window.localStorage.getItem(userId) || '{}');
        return userSettings[service] || {};
    }
    return undefined;
};
