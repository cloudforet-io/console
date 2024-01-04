<template>
    <fragment />
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { store } from '@/store';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import { isUserAccessibleToRoute } from '@/lib/access-control';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { loadAuth } from '@/services/auth/authenticator/loader';
import { getDefaultRouteAfterSignIn } from '@/services/auth/helpers/default-route-helper';

export default defineComponent({
    name: 'KeycloakPage',
    beforeRouteEnter(to, from, next) {
        if (from?.meta?.isSignInPage) {
            next((vm) => {
                vm.$router.replace({
                    query: { ...to.query, nextPath: from.query.nextPath },
                }).catch(() => {});
            });
        } else next();
    },
    props: {
        visible: {
            type: Boolean,
            default: undefined,
        },
        nextPath: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const router = useRouter();
        const appContextStore = useAppContextStore();
        const userWorkspaceStore = useUserWorkspaceStore();

        const state = reactive({
            beforeUser: store.state.user.userId,
        });
        const onSignIn = async (userId:string) => {
            try {
                const isSameUserAsPreviouslyLoggedInUser = state.beforeUser === userId;
                const hasBoundWorkspace = userWorkspaceStore.getters.workspaceList.length > 0;
                const defaultRoute = getDefaultRouteAfterSignIn(store.getters['user/hasSystemRole'], store.getters['user/hasPermission'] || hasBoundWorkspace);

                if (!props.nextPath || !isSameUserAsPreviouslyLoggedInUser) {
                    await router.push(defaultRoute);
                    return;
                }

                const resolvedRoute = router.resolve(props.nextPath);
                const isAdminRoute = resolvedRoute.route.matched.some((route) => route.path === '/admin');
                const isAccessible = isUserAccessibleToRoute(resolvedRoute.route, store.getters['user/isDomainAdmin'], store.getters['user/pageAccessPermissionList']);
                if (isAccessible) {
                    if (isAdminRoute) appContextStore.enterAdminMode();
                    await router.push(resolvedRoute.location);
                } else {
                    await router.push(defaultRoute);
                }
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };

        onMounted(async () => {
            await loadAuth('KEYCLOAK_OIDC').signIn(onSignIn);
        });
    },
});
</script>
