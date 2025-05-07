import { computed, reactive, watch } from 'vue';

import type { GrantScope } from '@/api-clients/identity/token/schema/type';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import type { GrantInfo } from '@/store/authorization/type';

import ErrorHandler from '@/common/composables/error/errorHandler';


interface GrantScopeGuardReturnType {
    callApiWithGrantGuard: () => Promise<void|null>;
}
export const useGrantScopeGuard = (requiredScopes: GrantScope[], apiFunction: () => Promise<void>): GrantScopeGuardReturnType => {
    const appContextStore = useAppContextStore();
    const authorizationStore = useAuthorizationStore();

    const state = reactive({
        currentGrantInfo: computed<GrantInfo>(() => authorizationStore.state.currentGrantInfo || { scope: 'USER' }),
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
