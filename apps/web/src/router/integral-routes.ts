import type { RouteConfig } from 'vue-router';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';

import { adminRoutes } from '@/router/admin-routes';
import { ROOT_ROUTE } from '@/router/constant';
import { errorRoutes } from '@/router/error-routes';
import { makeAdminRouteName } from '@/router/helpers/route-helper';
import { workspaceRoutes } from '@/router/workspace-routes';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useWorkspaceStore } from '@/store/app-context/workspace/workspace-store';

import { ACCESS_LEVEL } from '@/lib/access-control/config';

import { AUTH_ROUTE } from '@/services/auth/routes/route-constant';
import authRoutes from '@/services/auth/routes/routes';
import { HOME_DASHBOARD_ROUTE } from '@/services/home-dashboard/routes/route-constant';
import { MY_PAGE_ROUTE } from '@/services/my-page/routes/route-constant';
import myPageRoutes from '@/services/my-page/routes/routes';


export const integralRoutes: RouteConfig[] = [
    ...authRoutes,
    {
        path: '/',
        name: ROOT_ROUTE._NAME,
        // TODO: need to implement with SYSTEM_ADMIN
        redirect: () => {
            const isTokenAlive = SpaceConnector.isTokenAlive;
            if (!isTokenAlive) return ({ name: AUTH_ROUTE.SIGN_OUT._NAME });
            const appContextStore = useAppContextStore();
            if (appContextStore.getters.isAdminMode) return { name: ROOT_ROUTE.ADMIN._NAME };
            return { name: ROOT_ROUTE.WORKSPACE._NAME };
        },
        component: { template: '<router-view />' },
        children: [
            {
                path: '/admin',
                name: ROOT_ROUTE.ADMIN._NAME,
                meta: { accessLevel: ACCESS_LEVEL.ADMIN_PERMISSION },
                redirect: () => {
                    if (!store.getters['user/isDomainAdmin']) return { name: ROOT_ROUTE.WORKSPACE._NAME };
                    return ({ name: makeAdminRouteName(HOME_DASHBOARD_ROUTE._NAME) });
                },
                component: { template: '<router-view />' },
                children: [
                    ...adminRoutes,
                ],
            },
            {
                path: '/:workspaceId',
                name: ROOT_ROUTE.WORKSPACE._NAME,
                redirect: (to) => {
                    const workspaceStore = useWorkspaceStore();
                    const workspaceList = workspaceStore.getters.workspaceList;
                    const currentWorkspaceId = workspaceStore.getters.currentWorkspaceId;
                    const isValidWorkspace = workspaceList.some((workspace) => workspace.workspace_id === currentWorkspaceId);
                    if (currentWorkspaceId && isValidWorkspace) {
                        return ({
                            name: HOME_DASHBOARD_ROUTE._NAME,
                            params: {
                                ...to.params,
                                workspaceId: currentWorkspaceId,
                            },
                        });
                    }
                    if (workspaceList.length) {
                        const defaultWorkspaceId = workspaceList[0].workspace_id;
                        workspaceStore.setCurrentWorkspace(defaultWorkspaceId);
                        return ({
                            name: HOME_DASHBOARD_ROUTE._NAME,
                            params: {
                                ...to.params,
                                workspaceId: defaultWorkspaceId,
                            },
                        });
                    }
                    // TODO: handle no workspace case -> such as caution or error
                    return ({ name: MY_PAGE_ROUTE._NAME });
                },
                component: { template: '<router-view />' },
                children: [
                    ...workspaceRoutes,
                ],
            },
        ],
    },
    myPageRoutes,
    ...errorRoutes,
];
