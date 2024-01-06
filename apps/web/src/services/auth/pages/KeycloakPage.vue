<template>
    <fragment />
</template>

<script lang="ts">
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
import { HOME_DASHBOARD_ROUTE } from '@/services/home-dashboard/routes/route-constant';
import { MY_PAGE_ROUTE } from '@/services/my-page/routes/route-constant';

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

        onMounted(async () => {
            await loadAuth('KEYCLOAK_OIDC').signIn(onSignIn);
        });
    },
});
</script>
