import { computed, reactive } from 'vue';

import type { AxiosRequestConfig } from 'axios';
import { jwtDecode } from 'jwt-decode';
import { isEmpty } from 'lodash';
import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';
import { isInstanceOfAPIError } from '@cloudforet/core-lib/space-connector/error';

import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import type { RoleGetParameters } from '@/api-clients/identity/role/schema/api-verbs/get';
import type { RoleModel } from '@/api-clients/identity/role/schema/model';
import type { RoleType } from '@/api-clients/identity/role/type';
import type { TokenGrantParameters } from '@/api-clients/identity/token/schema/api-verbs/grant';
import type { TokenIssueParameters } from '@/api-clients/identity/token/schema/api-verbs/issue';
import type { TokenGrantModel, TokenIssueModel } from '@/api-clients/identity/token/schema/model';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { MANAGED_ROLES } from '@/store/authorization/constant';
import type {
    RoleInfo, JWTPayload, GrantInfo, SignInRequest,
} from '@/store/authorization/type';
import { useMenuStore } from '@/store/menu/menu-store';
import { pinia } from '@/store/pinia';

import type { PageAccessMap } from '@/lib/access-control/config';
import {
    checkAllMenuReadonly,
    getDefaultPageAccessPermissionList,
    getMinimalPageAccessPermissionList,
    getPageAccessMapFromRawData,
} from '@/lib/access-control/page-access-helper';
import type { MenuId } from '@/lib/menu/config';
import { setCurrentAccessedWorkspaceId } from '@/lib/site-initializer/last-accessed-workspace';


interface AuthorizationStoreState {
    currentRoleInfo?: RoleInfo;
    currentGrantInfo?: GrantInfo;
    grantAccessFailStatus: boolean;
}

export const useAuthorizationStore = defineStore('authorization', () => {
    const appContextStore = useAppContextStore(pinia);
    const userWorkspaceStore = useUserWorkspaceStore(pinia);
    const menuStore = useMenuStore(pinia);

    const state = reactive<AuthorizationStoreState>({
        currentRoleInfo: undefined,
        currentGrantInfo: undefined,
        grantAccessFailStatus: false,
    });

    const getters = reactive({
        isNoRoleUser: computed<boolean>(() => !state.currentRoleInfo),
        hasPermission: computed<boolean>(() => !!state.currentRoleInfo),
        pageAccessPermissionList: computed<MenuId[]>(() => {
            const roleType = state.currentRoleInfo?.roleType ?? 'USER';
            const roleBasePagePermissions = state.currentRoleInfo?.pageAccess ?? ['my_page.*'];
            const pagePermissionMap = getPageAccessMapFromRawData({
                pageAccessPermissions: roleBasePagePermissions,
                menuList: menuStore.getters.menuList,
            });
            const minimalPagePermissionList = getMinimalPageAccessPermissionList(roleType);
            const defaultPagePermissionList = getDefaultPageAccessPermissionList(roleType);

            Object.keys(pagePermissionMap).forEach((menuId) => {
                if (minimalPagePermissionList.includes(menuId as MenuId)) pagePermissionMap[menuId] = { read: true, write: true, access: true };
            });
            let result = [...minimalPagePermissionList];
            Object.keys(pagePermissionMap).forEach((menuId) => {
                const _menuId = menuId as MenuId;
                if (defaultPagePermissionList.includes(_menuId) && !minimalPagePermissionList.includes(_menuId) && pagePermissionMap[_menuId].access) result = [...result, _menuId];
            });

            return result;
        }),
        pageAccessPermissionMap: computed<PageAccessMap>(() => {
            const result: PageAccessMap = {};

            const roleType = state.currentRoleInfo?.roleType ?? 'USER';
            const roleBasePagePermissions = state.currentRoleInfo?.pageAccess ?? ['my_page.*'];
            const pagePermissionMap = getPageAccessMapFromRawData({
                pageAccessPermissions: roleBasePagePermissions,
                menuList: menuStore.getters.menuList,
            });
            const minimalPagePermissionList = getMinimalPageAccessPermissionList(roleType);

            const isAllReadOnly = checkAllMenuReadonly(roleBasePagePermissions);

            getters.pageAccessPermissionList.forEach((menuId) => {
                if (!result[menuId]) {
                    if (roleType === ROLE_TYPE.DOMAIN_ADMIN) {
                        result[menuId] = {
                            write: !isAllReadOnly,
                        };
                    } else {
                        result[menuId] = {
                            write: minimalPagePermissionList.includes(menuId) ? true : pagePermissionMap[menuId]?.write,
                        };
                    }
                }
            });
            return result;
        }),
    });

    const mutations = {
        setCurrentRoleInfo: (roleInfo?: RoleInfo) => {
            state.currentRoleInfo = roleInfo;
        },
        setCurrentGrantInfo: (grantInfo?: GrantInfo) => {
            state.currentGrantInfo = grantInfo;
        },
        setGrantAccessFailStatus: (status: boolean) => {
            state.grantAccessFailStatus = status;
        },
    };

    const signIn = async (signInRequest: SignInRequest): Promise<void> => {
        const domainId = signInRequest.domainId;
        let response;

        if (signInRequest.authType === 'SAML') {
            response = await SpaceConnector.clientV2.identity.token.grant<TokenGrantParameters, TokenGrantModel>({
                grant_type: 'REFRESH_TOKEN',
                scope: 'USER',
                token: signInRequest.credentials.refreshToken,
            }, { skipAuthRefresh: true });
            SpaceConnector.setToken(response.access_token, signInRequest.credentials.refreshToken);
        } else {
            response = await SpaceConnector.clientV2.identity.token.issue<TokenIssueParameters, TokenIssueModel>({
                domain_id: domainId,
                auth_type: signInRequest.authType,
                credentials: signInRequest.credentials,
                verify_code: signInRequest.verify_code,
            }, { skipAuthRefresh: true });
            SpaceConnector.setToken(response.access_token, response.refresh_token);
        }

        if (isEmpty(response)) {
            throw new Error();
        }
    };
    const signOut = () => {
        SpaceConnector.flushToken();
        state.currentGrantInfo = undefined;
        state.currentRoleInfo = undefined;
    };

    const grantRole = async (grantRequest: Omit<TokenGrantParameters, 'grant_type'>): Promise<boolean> => {
        const fetcher = getCancellableFetcher(SpaceConnector.clientV2.identity.token.grant)<TokenGrantParameters, TokenGrantModel>;
        let isGranted = false;

        try {
            // This is for not-triggered CASE, such as when user use browser back button.
            appContextStore.setGlobalGrantLoading(true);
            const { status, response } = await fetcher({
                grant_type: 'REFRESH_TOKEN',
                scope: grantRequest.scope,
                token: grantRequest.token,
                workspace_id: grantRequest.workspace_id,
            }, { skipAuthRefresh: true } as AxiosRequestConfig);
            if (status === 'succeed') {
                SpaceConnector.setToken(response.access_token);
                const currentRoleType = _getRoleTypeFromToken(response.access_token);

                const rootRoleInfo = await _getGrantedRole(response.role_id, currentRoleType);
                state.currentGrantInfo = {
                    scope: grantRequest.scope,
                    workspaceId: grantRequest.workspace_id,
                    pageAccess: rootRoleInfo?.pageAccess || undefined,
                };

                const currentRoleInfo = await _getGrantedRole(response.role_id, currentRoleType, response.role_type);
                state.currentRoleInfo = currentRoleInfo;

                if (grantRequest.scope === 'DOMAIN') {
                    appContextStore.enterAdminMode();
                } else appContextStore.exitAdminMode();
                if (grantRequest.scope === 'WORKSPACE' && grantRequest.workspace_id) {
                    userWorkspaceStore.setCurrentWorkspace(grantRequest.workspace_id);
                    await setCurrentAccessedWorkspaceId(grantRequest.workspace_id);
                }
                if (grantRequest.scope === 'USER') userWorkspaceStore.setCurrentWorkspace();

                if (currentRoleInfo) {
                    isGranted = true;
                }
                state.grantAccessFailStatus = false;
            }
        } catch (error) {
            console.error(error);
            /*
            * Unlike other cases where the ErrorHandler is used for error handling,
            * in the grant logic scenario, there can be instances where the Router
            * has not been initialized yet. Using the ErrorHandler in such situations
            * can lead to issues since it internally relies on the router.
            * Therefore, in this specific case, errors are simply logged to the console
            * and not further processed, to avoid complications with uninitialized Router instances.
            * */
            state.currentGrantInfo = undefined;
            state.currentRoleInfo = undefined;
            userWorkspaceStore.setCurrentWorkspace();
            appContextStore.exitAdminMode();

            if (isInstanceOfAPIError(error)) {
                if (error.code === 'ERROR_WORKSPACE_STATE') {
                    state.grantAccessFailStatus = true;
                } else if (error.code === 'ERROR_NOT_FOUND') {
                    state.grantAccessFailStatus = true;
                } else if (error.code === 'ERROR_PERMISSION_DENIED') {
                    state.grantAccessFailStatus = true;
                } else if (error.code === 'ERROR_AUTHENTICATE_FAILURE') {
                    SpaceConnector.flushToken();
                } else {
                    SpaceConnector.flushToken();
                }
            } else {
                SpaceConnector.flushToken();
            }
        } finally {
            /*
            * Implemented a global loading with a minimum duration of 500 milliseconds
            * during the grant process to prevent rendering of services until the process is complete.
            * */
            setTimeout(() => {
                appContextStore.setGlobalGrantLoading(false);
            }, 500);
        }
        return isGranted;
    };

    const actions = {
        grantRole,
        signIn,
        signOut,
    };

    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});


const _getGrantedRole = async (roleId: string, currentRoleType: RoleType, baseRoleType?: RoleType): Promise<RoleInfo|undefined> => {
    // DOMAIN_ADMIN -> enter workspace case
    if (baseRoleType === ROLE_TYPE.DOMAIN_ADMIN && currentRoleType === ROLE_TYPE.WORKSPACE_OWNER) {
        return {
            roleType: ROLE_TYPE.WORKSPACE_OWNER,
            roleId: 'managed-workspace-owner',
            pageAccess: ['*'],
        };
    }
    // USER -> grant USER case
    if (currentRoleType === ROLE_TYPE.USER) {
        return undefined;
    }

    // MANAGED_ROLE case
    const MANAGED_ROLE_IDS: string[] = Object.keys(MANAGED_ROLES);
    const isManagedRole = MANAGED_ROLE_IDS.includes(roleId);
    if (isManagedRole) {
        return {
            roleType: MANAGED_ROLES[roleId],
            roleId,
            pageAccess: ['*'],
        };
    }

    // normal case
    try {
        const response = await SpaceConnector.clientV2.identity.role.get<RoleGetParameters, RoleModel>({
            role_id: roleId,
        });

        return {
            roleType: response.role_type,
            roleId: response.role_id,
            pageAccess: response.page_access,
        };
    } catch (e) {
        console.error(`Role Load Error: ${e}`);
        return undefined;
    }
};
const _getRoleTypeFromToken = (token: string): RoleType => {
    const decodedToken = jwtDecode<JWTPayload>(token);
    return decodedToken.rol;
};
