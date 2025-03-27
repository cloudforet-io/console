import { computed, reactive, watch } from 'vue';

import type { GrantScope } from '@/schema/identity/token/type';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import type { GrantInfo } from '@/store/user/type';
import { useUserStore } from '@/store/user/user-store';

import ErrorHandler from '@/common/composables/error/errorHandler';


interface GrantScopeGuardReturnType {
    callApiWithGrantGuard: () => Promise<void|null>;
}
export const useGrantScopeGuard = (requiredScopes: GrantScope[], apiFunction: () => Promise<void>): GrantScopeGuardReturnType => {
    const appContextStore = useAppContextStore();
    const userStore = useUserStore();

    const state = reactive({
        currentGrantInfo: computed<GrantInfo>(() => userStore.state.currentGrantInfo || { scope: 'USER' }),
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
