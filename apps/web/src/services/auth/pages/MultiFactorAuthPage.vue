<script lang="ts" setup>
import { computed, onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { PTextButton } from '@cloudforet/mirinae';

import { store } from '@/store';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import MFAAuthenticationForm from '@/common/components/mfa/components/MFAAuthenticationForm.vue';

import { loadAuth } from '@/services/auth/authenticator/loader';
import { getDefaultRouteAfterSignIn } from '@/services/auth/helpers/default-route-helper';
import { AUTH_ROUTE } from '@/services/auth/routes/route-constant';


const route = useRoute();
const router = useRouter();
const userWorkspaceStore = useUserWorkspaceStore();

const {
    password, userId, mfaEmail, accessToken, mfaType,
} = route.params;

const state = reactive({
    isLocalLogin: computed<boolean>(() => (userId && !accessToken) || false),
    credentials: computed<Record<string, any>>(() => {
        if (!accessToken) {
            return {
                user_id: userId,
                password,
            };
        }
        return {
            access_token: accessToken,
        };
    }),
});

const checkSignIn = async (verificationCode: string) => {
    await loadAuth().signIn(state.credentials, 'MFA', verificationCode);
};

/* Event Handlers */
const handleClickGoBackButton = () => {
    router.replace({ name: AUTH_ROUTE.SIGN_IN._NAME });
};
const handleConfirmed = async () => {
    if (store.state.user.requiredActions?.includes('UPDATE_PASSWORD')) {
        await router.push({ name: AUTH_ROUTE.PASSWORD.STATUS.RESET._NAME });
    } else {
        const hasBoundWorkspace = userWorkspaceStore.getters.workspaceList.length > 0;
        const defaultRoute = getDefaultRouteAfterSignIn(hasBoundWorkspace);
        await router.push(defaultRoute).catch(() => {});
    }
};

/* Lifecycle */
onMounted(() => {
    if (state.isLocalLogin) {
        if (!userId) {
            router.push({ name: AUTH_ROUTE.SIGN_IN._NAME });
        }
    } else if (!accessToken) {
        router.push({ name: AUTH_ROUTE.SIGN_IN._NAME });
    }
});
</script>

<template>
    <div class="multi-factor-authentication-page">
        <m-f-a-authentication-form
            class="form-wrapper"
            :password="password"
            :user-id="userId"
            :mfa-email="mfaEmail"
            :mfa-type="mfaType"
            :access-token="accessToken"
            :confirm-event="checkSignIn"
            @confirmed="handleConfirmed"
        >
            <template #toolbox-left>
                <p-text-button class="go-back-button mr-2"
                               icon-left="ic_arrow-left"
                               style-type="highlight"
                               size="md"
                               @click="handleClickGoBackButton"
                >
                    {{ $t('AUTH.MFA.GO_BACK') }}
                </p-text-button>
            </template>
        </m-f-a-authentication-form>
    </div>
</template>

<style lang="postcss" scoped>
.multi-factor-authentication-page {
    @apply flex flex-col;
    width: 100%;
    margin-top: 6rem;
    .form-wrapper {
        @apply relative flex flex-col border border-gray-200 bg-white;
        width: 100%;
        max-width: 28.5rem;
        padding: 2rem;
        align-self: center;
        gap: 0.5rem;
        border-radius: 0.375rem;
    }
}
</style>
