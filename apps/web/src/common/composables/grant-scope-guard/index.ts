import { computed, reactive, watch } from 'vue';

import type { GrantScope } from '@/schema/identity/token/type';
import { store } from '@/store';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import ErrorHandler from '@/common/composables/error/errorHandler';


export const useGrantScopeGuard = (requiredScopes: GrantScope[], apiFunction: () => Promise<void>) => {
    const appContextStore = useAppContextStore();

    const state = reactive({
        currentGrantInfo: computed(() => store.getters['user/getCurrentGrantInfo'] || { scope: 'USER' }),
        isLoading: computed(() => appContextStore.getters.globalGrantLoading),
        isValidScope: computed(() => requiredScopes.includes(state.currentGrantInfo.scope)),
    });


    const callApiWithGrantGuard = async (): Promise<void|null> => {
        if (state.isValidScope && !state.isLoading) {
            try {
                return await apiFunction();
            } catch (error) {
                ErrorHandler.handleError(error);
                return null;
            }
        } else {
            return null;
        }
    };

    watch(() => state.isLoading, async () => {
        await callApiWithGrantGuard();
    });

    return { callApiWithGrantGuard };
};
