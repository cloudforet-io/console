import { useAppContextStore } from '@/store/app-context/app-context-store';
import { pinia } from '@/store/pinia';

export const initModeSetting = () => {
    // NOTE: this is to use pinia store outside vue component
    useAppContextStore(pinia);

    const appContextStore = useAppContextStore();

    const { pathname } = window.location;
    const modePath = pathname?.split('/')[1];
    if (modePath === 'admin') {
        appContextStore.switchToAdminMode();
    }
};
