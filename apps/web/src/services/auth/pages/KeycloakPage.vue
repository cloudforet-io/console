<script lang="ts">
// eslint-disable-next-line import/order,import/no-duplicates
import { defineComponent } from 'vue';

// eslint-disable-next-line import/export
export default defineComponent({
    beforeRouteEnter(to, from, next) {
        if (from?.meta?.isSignInPage) {
            next((vm) => {
                vm.$router.replace({
                    query: { ...to.query, previousPath: from.query.previousPath, redirectPath: from.query.redirectPath },
                }).catch(() => {});
            });
        } else next();
    },
});
</script>

<script lang="ts" setup>
/* eslint-disable import/first */
// eslint-disable-next-line import/no-duplicates
import { defineComponent, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { PSpinner } from '@cloudforet/mirinae';

import { SpaceRouter } from '@/router';
import { store } from '@/store';

import { ERROR_ROUTE } from '@/router/constant';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { loadAuth } from '@/services/auth/authenticator/loader';
import { getDefaultRouteAfterSignIn } from '@/services/auth/helpers/default-route-helper';
import { AUTH_ROUTE } from '@/services/auth/routes/route-constant';

interface Props {
    visible?: boolean;
    previousPath?: string;
    redirectPath?: string;
}

const props = withDefaults(defineProps<Props>(), {
    visible: undefined,
    previousPath: undefined,
    redirectPath: undefined,
});
const router = useRouter();
const appContextStore = useAppContextStore();
const userWorkspaceStore = useUserWorkspaceStore();

const state = reactive({
    beforeUser: store.state.user.userId,
    token: '',
});
const onSignIn = async (userId:string) => {
    appContextStore.setGlobalGrantLoading(true);
    try {
        const isSameUserAsPreviouslyLoggedInUser = state.beforeUser === userId;
        const hasBoundWorkspaces = userWorkspaceStore.getters.workspaceList.length > 0;
        const defaultRoute = getDefaultRouteAfterSignIn(hasBoundWorkspaces);

        if (props.redirectPath) {
            await router.push(router.resolve(props.redirectPath).location).catch(() => {
                router.push(defaultRoute).catch(() => {});
            });
            return;
        }

        if (!props.previousPath || !isSameUserAsPreviouslyLoggedInUser) {
            await router.push(defaultRoute);
            return;
        }

        const resolvedRoute = router.resolve(props.previousPath);
        const allRoutes = SpaceRouter.router.getRoutes();

        const isValidRoute = allRoutes.some((route) => route.name === resolvedRoute.route.name);
        if (isValidRoute) {
            await router.push(resolvedRoute.location);
        } else {
            await router.push(defaultRoute);
        }
    } catch (e) {
        appContextStore.setGlobalGrantLoading(false);
        ErrorHandler.handleError(e);
    }
};

const onErrorSignIn = (e, token) => {
    state.token = token;
    if (e.message.includes('MFA')) {
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
        const userEmail = e.message.match(emailRegex);
        router.push({
            name: AUTH_ROUTE.SIGN_IN.MULTI_FACTOR_AUTH._NAME,
            params: {
                accessToken: state.token,
                mfaEmail: userEmail[0],
                userId: state.beforeUser,
            },
        });
    } else {
        ErrorHandler.handleRequestError(e, e.message);
        router.push({
            name: ERROR_ROUTE._NAME,
            params: { statusCode: '401' },
        });
    }
};

onMounted(async () => {
    await loadAuth('KEYCLOAK_OIDC').signIn(onSignIn, onErrorSignIn);
});
</script>

<template>
    <div class="keycloak-page">
        <p-spinner size="xl" />
    </div>
</template>

<style lang="postcss" scoped>
.keycloak-page {
    @apply flex flex-col items-center justify-center bg-white;
    flex-grow: 1;
    overflow-y: auto;
    padding: 2.5rem;
}
</style>
