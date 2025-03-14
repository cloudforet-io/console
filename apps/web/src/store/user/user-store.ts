import { computed, reactive, watch } from 'vue';

import { jwtDecode } from 'jwt-decode';
import { isEmpty } from 'lodash';
import { defineStore } from 'pinia';

import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';
import { isInstanceOfAPIError } from '@cloudforet/core-lib/space-connector/error';

import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import type { RoleGetParameters } from '@/api-clients/identity/role/schema/api-verbs/get';
import type { RoleModel } from '@/api-clients/identity/role/schema/model';
import type { RoleType } from '@/api-clients/identity/role/type';
import type { TokenGrantParameters } from '@/api-clients/identity/token/schema/api-verbs/grant';
import type { TokenIssueParameters } from '@/api-clients/identity/token/schema/api-verbs/issue';
import type {
    TokenGrantModel,
    TokenIssueModel,
} from '@/api-clients/identity/token/schema/model';
import type { UserProfileUpdateParameters } from '@/api-clients/identity/user-profile/schema/api-verbs/update';
import type { UserModel, UserMfa } from '@/api-clients/identity/user/schema/model';
import { setI18nLocale } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useDomainStore } from '@/store/domain/domain-store';
import { useErrorStore } from '@/store/error/error-store';
import { languages, MANAGED_ROLES, USER_STORAGE_KEY } from '@/store/user/constant';
import type {
    RoleInfo,
    SignInRequest,
    JWTPayload,
    UserStoreGetters,
    UserStoreState,
} from '@/store/user/type';

import type { PageAccessMap } from '@/lib/access-control/config';
import {
    checkAllMenuReadonly,
    getDefaultPageAccessPermissionList,
    getMinimalPageAccessPermissionList,
    getPageAccessMapFromRawData,
} from '@/lib/access-control/page-access-helper';
import type { MenuId } from '@/lib/menu/config';
import { setCurrentAccessedWorkspaceId } from '@/lib/site-initializer/last-accessed-workspace';



const getUserInfo = async (): Promise<Partial<UserStoreState>> => {
    const response = await SpaceConnector.clientV2.identity.userProfile.get<
    undefined,
    UserModel
  >();
    return {
        userId: response.user_id,
        roleType: response.role_type,
        authType: response.auth_type,
        name: response.name,
        email: response.email,
        language: response.language,
        timezone: response.timezone,
        requiredActions: response.required_actions,
        emailVerified: !!response.email_verified,
        mfa: response.mfa,
    };
};

const getGrantedRole = async (roleId: string, currentRoleType: RoleType, baseRoleType?: RoleType): Promise<RoleInfo|undefined> => {
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
const getRoleTypeFromToken = (token: string): RoleType => {
    const decodedToken = jwtDecode<JWTPayload>(token);
    return decodedToken.rol;
};

export const useUserStore = defineStore('user-store', () => {
    const domainStore = useDomainStore();
    let storedUserState: Partial<UserStoreState> = {};
    try {
        storedUserState = LocalStorageAccessor.getItem(USER_STORAGE_KEY) ?? {};
    } catch (e) {
        LocalStorageAccessor.removeItem(USER_STORAGE_KEY);
    }

    const state = reactive<UserStoreState>({
        isSessionExpired: undefined,
        userId: storedUserState.userId,
        userType: storedUserState.userType,
        roleType: storedUserState.roleType,
        authType: storedUserState.authType,
        name: storedUserState.name,
        email: storedUserState.email,
        language: (storedUserState.language && languages[storedUserState.language]) ? storedUserState.language : 'en',
        timezone: storedUserState.timezone,
        currentGrantInfo: undefined, // "currentGrantInfo" is for optimization of grant API call
        currentRoleInfo: storedUserState.currentRoleInfo,
        requiredActions: storedUserState.requiredActions,
        emailVerified: storedUserState.emailVerified,
        isSignInLoading: false,
        mfa: storedUserState.mfa,
    });
    const getters = reactive<UserStoreGetters>({
        isDomainAdmin: computed<boolean>(() => state.roleType === ROLE_TYPE.DOMAIN_ADMIN),
        isSystemAdmin: computed<boolean>(() => state.roleType === ROLE_TYPE.SYSTEM_ADMIN),
        domainId: computed<string>(() => domainStore.state.domainId),
        languageLabel: computed<string>(() => languages[state.language as string] || state.language),
        isNoRoleUser: computed<boolean>(() => !state.currentRoleInfo),
        hasAdminOrWorkspaceOwnerRole: computed<boolean>(() => state.roleType === 'DOMAIN_ADMIN' || state.roleType === 'WORKSPACE_OWNER'),
        hasPermission: computed<boolean>(() => !!state.currentRoleInfo),
        pageAccessPermissionList: computed<MenuId[]>(() => {
            const roleType = state.currentRoleInfo?.roleType ?? 'USER';
            const roleBasePagePermissions = state.currentRoleInfo?.pageAccess ?? ['my_page.*'];
            const pagePermissionMap = getPageAccessMapFromRawData(roleBasePagePermissions, getters.domainId);
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
            const pagePermissionMap = getPageAccessMapFromRawData(roleBasePagePermissions, getters.domainId);
            const minimalPagePermissionList = getMinimalPageAccessPermissionList(roleType);

            const isAllReadOnly = checkAllMenuReadonly(roleBasePagePermissions);

            getters.pageAccessPermissionList?.forEach((menuId) => {
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

    /* Mutations */
    const setIsSessionExpired = (val: boolean) => { state.isSessionExpired = val; };
    const setLanguage = (val: string) => { state.language = val; };
    const setTimezone = (val: string) => { state.timezone = val; };
    const setCurrentGrantInfo = (val: any) => { state.currentGrantInfo = val; };
    const setCurrentRoleInfo = (val: any) => { state.currentRoleInfo = val; };
    const setIsSignInLoading = (val: boolean) => { state.isSignInLoading = val; };
    const setEmailVerified = (val: boolean) => { state.emailVerified = val; };
    const setMfa = (val: UserMfa) => { state.mfa = val; };
    const setEmail = (val: string) => { state.email = val; };
    const setUserId = (val: string) => { state.userId = val; };
    const mutations = {
        setIsSessionExpired,
        setLanguage,
        setTimezone,
        setCurrentGrantInfo,
        setCurrentRoleInfo,
        setIsSignInLoading,
        setEmailVerified,
        setMfa,
        setEmail,
        setUserId,
    };

    /* Actions */
    const setUserInfo = async (userInfo: UserStoreState) => {
        state.userId = userInfo.userId;
        state.authType = userInfo.authType;
        state.roleType = userInfo.roleType;
        state.name = userInfo.name;
        state.email = userInfo.email;
        state.language = userInfo.language;
        state.timezone = userInfo.timezone;
        state.requiredActions = userInfo.requiredActions;
        state.emailVerified = userInfo.emailVerified;
        state.mfa = userInfo.mfa;
        state.currentRoleInfo = userInfo.currentRoleInfo;

        if (userInfo.language) {
            await setI18nLocale(userInfo.language);
        }
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

        const userInfo = await getUserInfo();
        await setUserInfo(userInfo);
        state.isSessionExpired = false;
    };
    const signOut = () => {
        SpaceConnector.flushToken();
        state.currentGrantInfo = undefined;
        state.currentRoleInfo = undefined;
    };
    /*
     * @returns { Promise<boolean> } isGranted
     */
    const grantRole = async (grantRequest: Omit<TokenGrantParameters, 'grant_type'>): Promise<boolean> => {
        const appContextStore = useAppContextStore();
        const userWorkspaceStore = useUserWorkspaceStore();
        const errorStore = useErrorStore();
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
            }, { skipAuthRefresh: true });
            if (status === 'succeed') {
                SpaceConnector.setToken(response.access_token);
                const currentRoleType = getRoleTypeFromToken(response.access_token);

                const rootRoleInfo = await getGrantedRole(response.role_id, currentRoleType);
                state.currentGrantInfo = {
                    scope: grantRequest.scope,
                    workspaceId: grantRequest.workspace_id,
                    pageAccess: rootRoleInfo?.pageAccess || undefined,
                };

                const currentRoleInfo = await getGrantedRole(response.role_id, currentRoleType, response.role_type);
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
                errorStore.setGrantAccessFailStatus(false);
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
                    errorStore.setGrantAccessFailStatus(true);
                } else if (error.code === 'ERROR_NOT_FOUND') {
                    errorStore.setGrantAccessFailStatus(true);
                } else if (error.code === 'ERROR_PERMISSION_DENIED') {
                    errorStore.setGrantAccessFailStatus(true);
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

    const updateUser = async (userRequest: UserProfileUpdateParameters): Promise<void> => {
        let _name = userRequest.name;
        if (userRequest.name === '') _name = ' '; // NOTE: discussed solution by detour way in case of name removal
        await SpaceConnector.clientV2.identity.userProfile.update<UserProfileUpdateParameters>({
            name: _name,
            password: userRequest.password,
            email: userRequest.email,
            language: userRequest.language,
            timezone: userRequest.timezone,
            tags: userRequest.tags,
        });

        state.name = userRequest.name === undefined ? state.name : userRequest.name;
        state.email = userRequest.email || state.email;
        state.language = userRequest.language || state.language;
        state.timezone = userRequest.timezone || state.timezone;
        if (userRequest.language) {
            await setI18nLocale(userRequest.language);
        }
    };

    const actions = {
        setUserInfo,
        signIn,
        signOut,
        grantRole,
        updateUser,
    };

    /* Plugin */
    watch(() => state, (newValue) => {
        LocalStorageAccessor.setItem(USER_STORAGE_KEY, newValue);
    }, { deep: true });

    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
