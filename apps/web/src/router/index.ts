import Vue from 'vue';
import type { RouteConfig } from 'vue-router';
import VueRouter from 'vue-router';

import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { GrantScope } from '@/schema/identity/token/type';

import { ERROR_ROUTE } from '@/router/constant';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import type { RoleInfo } from '@/store/modules/user/type';
import { pinia } from '@/store/pinia';

import { getRouteAccessLevel, getUserAccessLevel } from '@/lib/access-control';
import { ACCESS_LEVEL } from '@/lib/access-control/config';
import { getRecentConfig } from '@/lib/helper/router-recent-helper';
import { GTag } from '@/lib/site-analytics/gtag';

import { AUTH_ROUTE } from '@/services/auth/routes/route-constant';
import { HOME_DASHBOARD_ROUTE } from '@/services/home-dashboard/routes/route-constant';

const CHUNK_LOAD_REFRESH_STORAGE_KEY = 'SpaceRouter/ChunkLoadFailRefreshed';

const getCurrentTime = (): number => Math.floor(Date.now() / 1000);
const grantCurrentScope = async (scope: GrantScope, token: string, workspaceId?: string): Promise<RoleInfo|undefined> => {
    const existingGrantInfo = SpaceRouter.router.app?.$store.getters['user/getCurrentGrantInfo'];
    const isDuplicateScope = scope !== 'WORKSPACE' && existingGrantInfo?.scope === scope;
    const isDuplicateWorkspace = workspaceId && workspaceId === existingGrantInfo?.workspaceId;
    if (isDuplicateScope || isDuplicateWorkspace) return undefined;

    const grantRequest = {
        scope,
        token,
        workspace_id: workspaceId,
    };

    await SpaceRouter.router.app?.$store.dispatch('user/grantRole', grantRequest);
    return SpaceRouter.router.app?.$store.getters['user/getCurrentRoleInfo'];
};
const loadAllReferencesByGrantedRoleInfo = async (grantedRoleInfo?: RoleInfo) => {
    if (grantedRoleInfo) {
        await SpaceRouter.router.app?.$store.dispatch('reference/initializeAllReference');
    }
};

export class SpaceRouter {
    static router: VueRouter;

    static init(routes: RouteConfig[]) {
        if (SpaceRouter.router) throw new Error('Router init failed: Already initiated.');

        Vue.use(VueRouter);

        SpaceRouter.router = new VueRouter({
            mode: 'history',
            linkActiveClass: 'open active',
            routes,
        });

        let nextPath: string;
        const appContextStore = useAppContextStore(pinia);
        const userWorkspaceStore = useUserWorkspaceStore(pinia);

        SpaceRouter.router.onError((error) => {
            console.error(error);

            if (error.name === 'ChunkLoadError') {
                const lastCheckedTime = LocalStorageAccessor.getItem(CHUNK_LOAD_REFRESH_STORAGE_KEY);
                if (!lastCheckedTime) {
                    LocalStorageAccessor.setItem(CHUNK_LOAD_REFRESH_STORAGE_KEY, getCurrentTime().toString());
                    window.location.href = nextPath ?? '/';
                } else if (getCurrentTime() - parseInt(lastCheckedTime) < 10) {
                    window.location.href = nextPath ?? '/';
                }
            }
        });

        SpaceRouter.router.onReady(() => {
            LocalStorageAccessor.setItem(CHUNK_LOAD_REFRESH_STORAGE_KEY, '');
        });

        SpaceRouter.router.beforeEach(async (to, from, next) => {
            const isAdminMode = appContextStore.getters.isAdminMode;


            /* Browser Back Button Case
            *  isAdminMode state is not changed when browser back button is clicked. (route: admin <-> workspace)
            *  So, when the user clicks the browser back button, the isAdminMode state is changed to the correct state.
            *  This is allowed ONLY THIS CASE
            * */
            // [CASE] Admin Mode -> Workspace Mode -> (back button) Admin Mode
            if (to.name?.startsWith('admin.') && !isAdminMode) {
                appContextStore.enterAdminMode();
            }
            // [CASE] Workspace Mode -> Admin Mode -> (back button) Workspace Mode
            if (!to.name?.startsWith('admin.') && isAdminMode) {
                appContextStore.exitAdminMode();
            }


            nextPath = to.fullPath;
            const isTokenAlive = SpaceConnector.isTokenAlive;
            const isNotErrorRoute = to.name !== ERROR_ROUTE._NAME;

            // Grant Refresh Token
            const refreshToken = SpaceConnector.getRefreshToken();

            if (refreshToken && isTokenAlive && isNotErrorRoute) {
                let workspaceId: string|undefined;
                let scope: GrantScope;
                if (to.name?.startsWith('admin.') || appContextStore.getters.isAdminMode) {
                    scope = 'DOMAIN';
                } else if (to.path?.startsWith('/workspace-') && to.params.workspaceId) {
                    scope = 'WORKSPACE';
                    workspaceId = to.params.workspaceId;
                } else scope = 'USER';

                const grantedRoleInfo = await grantCurrentScope(scope, refreshToken, workspaceId);
                await loadAllReferencesByGrantedRoleInfo(grantedRoleInfo);
            }

            const grantAcessFailStatus = SpaceRouter.router.app?.$store.state.error.grantAccessFailStatus;
            const userPagePermissions = SpaceRouter.router.app?.$store.getters['user/pageAccessPermissionList'];
            const routeAccessLevel = getRouteAccessLevel(to);
            const userAccessLevel = getUserAccessLevel(to, SpaceRouter.router.app?.$store.getters['user/isDomainAdmin'], userPagePermissions, isTokenAlive);

            const userNeedPwdReset = SpaceRouter.router.app?.$store.getters['user/isUserNeedPasswordReset'];
            let nextLocation;


            if (grantAcessFailStatus) {
                await userWorkspaceStore.load();
                nextLocation = { name: ERROR_ROUTE._NAME, params: { statusCode: '404' } };
                SpaceRouter.router.app?.$store.commit('error/setGrantAccessFailStatus', false);

            // When a user is authenticated
            } else if (userAccessLevel >= ACCESS_LEVEL.AUTHENTICATED) {
                // When a user need to reset password and tries to go to other pages, redirect to reset password page
                if (userNeedPwdReset && to.name !== AUTH_ROUTE.PASSWORD.STATUS.RESET._NAME && to.name !== AUTH_ROUTE.SIGN_OUT._NAME) {
                    nextLocation = { name: AUTH_ROUTE.PASSWORD.STATUS.RESET._NAME };
                // When a user is already signed in and tries to go to sign in page, redirect to home-dashboard page
                } else if (to.meta?.isSignInPage) {
                    nextLocation = { name: HOME_DASHBOARD_ROUTE._NAME };
                // When a user tries to go to inaccessible page, redirect to error page (Exclude Admin Mode)
                } else if (userAccessLevel < routeAccessLevel) {
                    // When a user tries to another available workspace without target page's access permission.
                    // e.g. In A workspace Dashboard, try to toggle B workspace without dashboard access permission.
                    const isAccessibleWorkspace = userWorkspaceStore.getIsAccessibleWorkspace(to.params.workspaceId);
                    if (isAccessibleWorkspace) {
                        nextLocation = { name: HOME_DASHBOARD_ROUTE._NAME, params: { workspaceId: to.params.workspaceId } };
                    } else nextLocation = { name: ERROR_ROUTE._NAME, params: { statusCode: '404' } };
                }

            // When an unauthenticated(or token expired) user tries to access a page that only authenticated users can enter, refresh token
            } else if (routeAccessLevel >= ACCESS_LEVEL.AUTHENTICATED) {
                if (!isTokenAlive) {
                    // When refreshing token is failed, redirect to sign in page
                    const res = await SpaceConnector.refreshAccessToken(false);
                    if (!res) nextLocation = { name: AUTH_ROUTE.SIGN_OUT._NAME, query: { nextPath: to.fullPath } };
                }
            }

            // If top notification which indicates authorization error is visible, clear it before moving to next location
            if (SpaceRouter.router.app?.$store.state.error.visibleAuthorizationError) {
                SpaceRouter.router.app?.$store.commit('error/setVisibleAuthorizationError', false);
            }

            next(nextLocation);
        });

        SpaceRouter.router.afterEach((to) => {
            // set target page as GTag page view
            if (GTag.gtag) GTag.setPageView(to);

            const store = SpaceRouter.router.app?.$store;
            if (!store) return;
            const isAdminMode = appContextStore.getters.isAdminMode;
            const routeAccessLevel = getRouteAccessLevel(to);
            const isWorkspaceRoute = routeAccessLevel >= ACCESS_LEVEL.WORKSPACE_PERMISSION;

            if (!isAdminMode && isWorkspaceRoute) {
                const recent = getRecentConfig(to);
                if (recent) {
                    store.dispatch('recent/addItem', {
                        itemType: recent.itemType,
                        workspaceId: recent.workspaceId,
                        itemId: recent.itemId,
                    });
                }
            }
        });

        return SpaceRouter.router;
    }
}
