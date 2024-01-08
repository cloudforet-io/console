<script lang="ts">
// eslint-disable-next-line import/order,import/no-duplicates
import { defineComponent } from 'vue';

// eslint-disable-next-line import/export
export default defineComponent({
    beforeRouteEnter(to, from, next) {
        if (from?.meta?.isSignInPage) {
            next((vm) => {
                vm.$router.replace({
                    query: { ...to.query, nextPath: from.query.nextPath },
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

import { store } from '@/store';

import { ROOT_ROUTE } from '@/router/constant';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import { isUserAccessibleToRoute } from '@/lib/access-control';
import { getLastAccessedWorkspaceId } from '@/lib/site-initializer/last-accessed-workspace';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { loadAuth } from '@/services/auth/authenticator/loader';
import { getDefaultRouteAfterSignIn } from '@/services/auth/helpers/default-route-helper';
import { AUTH_ROUTE } from '@/services/auth/routes/route-constant';
import { HOME_DASHBOARD_ROUTE } from '@/services/home-dashboard/routes/route-constant';
import { MY_PAGE_ROUTE } from '@/services/my-page/routes/route-constant';

interface Props {
    visible?: boolean;
    nextPath?: string;
}

const props = withDefaults(defineProps<Props>(), {
    visible: undefined,
    nextPath: undefined,
});
const router = useRouter();
const appContextStore = useAppContextStore();
const userWorkspaceStore = useUserWorkspaceStore();

const state = reactive({
    beforeUser: store.state.user.userId,
    token: '',
});
const onSignIn = async (userId:string) => {
    try {
        const isSameUserAsPreviouslyLoggedInUser = state.beforeUser === userId;
        const hasBoundWorkspace = userWorkspaceStore.getters.workspaceList.length > 0;
        const defaultRoute = getDefaultRouteAfterSignIn(hasBoundWorkspace);
        const lastAccessedWorkspaceId = await getLastAccessedWorkspaceId();
        const defaultRouteWithWorkspace = {
            ...defaultRoute,
            ...(defaultRoute.name === MY_PAGE_ROUTE._NAME || !lastAccessedWorkspaceId ? {} : {
                params: {
                    workspaceId: lastAccessedWorkspaceId,
                },
            }),
        };

        if (!props.nextPath || !isSameUserAsPreviouslyLoggedInUser) {
            await router.push(defaultRouteWithWorkspace);
            return;
        }

        const resolvedRoute = router.resolve(props.nextPath);
        const isAdminRoute = resolvedRoute.route.matched.some((route) => route.path === '/admin');
        const isAccessible = isUserAccessibleToRoute(resolvedRoute.route, store.getters['user/isDomainAdmin'], store.getters['user/pageAccessPermissionList']);
        if (isAccessible) {
            if (resolvedRoute.resolved.name === HOME_DASHBOARD_ROUTE._NAME) {
                await router.push({
                    name: ROOT_ROUTE.WORKSPACE._NAME,
                    params: {
                        workspaceId: resolvedRoute.resolved.params.workspaceId,
                    },
                });
            }
            if (isAdminRoute) appContextStore.enterAdminMode();
            await router.push(resolvedRoute.location);
        } else {
            await router.push(defaultRouteWithWorkspace);
        }
    } catch (e) {
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
        ErrorHandler.handleError(e);
    }
};

onMounted(async () => {
    await loadAuth('KEYCLOAK_OIDC').signIn(onSignIn, onErrorSignIn);
});
</script>

<template>
    <fragment />
</template>
