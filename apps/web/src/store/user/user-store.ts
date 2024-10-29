import type { ComputedRef, UnwrapRef } from 'vue';
import { reactive, computed } from 'vue';

import jwtDecode from 'jwt-decode';
import { defineStore } from 'pinia';

import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';
import { isInstanceOfAPIError } from '@cloudforet/core-lib/space-connector/error';

import type { RoleGetParameters } from '@/schema/identity/role/api-verbs/get';
import { ROLE_TYPE } from '@/schema/identity/role/constant';
import type { RoleModel } from '@/schema/identity/role/model';
import type { RoleType } from '@/schema/identity/role/type';
import type { TokenGrantParameters } from '@/schema/identity/token/api-verbs/grant';
import type { TokenIssueParameters } from '@/schema/identity/token/api-verbs/issue';
import type { TokenGrantModel, TokenIssueModel } from '@/schema/identity/token/model';
import type { UserProfileUpdateParameters } from '@/schema/identity/user-profile/api-verbs/update';
import type { UserGetParameters } from '@/schema/identity/user/api-verbs/get';
import type { UserModel } from '@/schema/identity/user/model';
import { setI18nLocale } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useErrorStore } from '@/store/error/error-store';
// eslint-disable-next-line import/no-cycle
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import { MANAGED_ROLES } from '@/store/user/constant';
import type {
    RoleInfo, SignInRequest, UpdateUserRequest, UserState,
    GrantInfo,
} from '@/store/user/type';

import type { PageAccessMap } from '@/lib/access-control/config';
import {
    checkAllMenuReadonly, getDefaultPageAccessPermissionList,
    getMinimalPageAccessPermissionList,
    getPageAccessMapFromRawData,
} from '@/lib/access-control/page-access-helper';
import type { MenuId } from '@/lib/menu/config';
import { setCurrentAccessedWorkspaceId } from '@/lib/site-initializer/last-accessed-workspace';

import { languages } from '@/services/advanced/constants/domain-settings-constaint';

const STORAGE_KEY = 'store/user';

interface JWTPayload {
    rol: RoleType;
}
export const useUserStore = defineStore('user-store', () => {
    let storedUserInfo: Partial<UserState> = {};

    try {
        storedUserInfo = LocalStorageAccessor.getItem(STORAGE_KEY) ?? {};
    } catch (e) {
        LocalStorageAccessor.removeItem(STORAGE_KEY);
    }

    const state = reactive<UserState>({
        isSessionExpired: undefined,
        userId: storedUserInfo.userId,
        userType: storedUserInfo.userType,
        roleType: storedUserInfo.roleType,
        authType: storedUserInfo.authType,
        name: storedUserInfo.name,
        email: storedUserInfo.email,
        language: (storedUserInfo.language && languages[storedUserInfo.language]) ? storedUserInfo.language : 'en',
        timezone: storedUserInfo.timezone,
        // "currentGrantInfo" is for optimization of grant API call
        currentGrantInfo: undefined,
        currentRoleInfo: storedUserInfo.currentRoleInfo,
        requiredActions: storedUserInfo.requiredActions,
        emailVerified: storedUserInfo.emailVerified,
        isSignInLoading: false,
        mfa: storedUserInfo.mfa,
    });

    interface UserStoreGetters {
        isDomainAdmin: ComputedRef<boolean>;
        isSystemAdmin: ComputedRef<boolean>;
        languageLabel: ComputedRef<string>;
        isNoRoleUser: ComputedRef<boolean>;
        hasSystemRole: ComputedRef<boolean>;
        hasAdminOrWorkspaceOwnerRole: ComputedRef<boolean>;
        hasPermission: ComputedRef<boolean>;
        getCurrentRoleInfo: ComputedRef<RoleInfo|undefined>;
        getCurrentGrantInfo: ComputedRef<GrantInfo|undefined>;
        isRootRoleReadonly: ComputedRef<boolean>;
        pageAccessPermissionList: ComputedRef<MenuId[]>;
        pageAccessPermissionMap: ComputedRef<PageAccessMap>;
        isUserNeedPasswordReset: ComputedRef<boolean>;
    }
    const getters: UnwrapRef<UserStoreGetters> = reactive({
        // TODO: temporary defence
        isDomainAdmin: computed<boolean>(() => state.roleType === ROLE_TYPE.DOMAIN_ADMIN),
        isSystemAdmin: computed<boolean>(() => state.roleType === ROLE_TYPE.SYSTEM_ADMIN),
        languageLabel: computed<string>(() => languages[state.language as string] || state.language),
        isNoRoleUser: computed<boolean>(() => !state.currentRoleInfo),
        hasSystemRole: computed<boolean>(() => state.roleType === 'SYSTEM_ADMIN'),
        hasAdminOrWorkspaceOwnerRole: computed<boolean>(() => state.roleType === 'DOMAIN_ADMIN' || state.roleType === 'WORKSPACE_OWNER'),
        // TODO: this need to calculate with user workspace list
        hasPermission: computed<boolean>(() => !!state.currentRoleInfo),
        getCurrentRoleInfo: computed<RoleInfo|undefined>(() => state.currentRoleInfo),
        getCurrentGrantInfo: computed<GrantInfo|undefined>(() => state.currentGrantInfo),
        isRootRoleReadonly: computed<boolean>(() => {
            const roleBasePagePermissions = getters.getCurrentGrantInfo?.pageAccess ?? ['my_page.*'];
            return checkAllMenuReadonly(roleBasePagePermissions);
        }),
        pageAccessPermissionList: computed<MenuId[]>(() => {
            const roleType = getters.getCurrentRoleInfo?.roleType ?? 'USER';
            const roleBasePagePermissions = getters.getCurrentRoleInfo?.pageAccess ?? ['my_page.*'];
            // TODO: type of roleBasePagePermissions must be checked
            const pagePermissionMap = getPageAccessMapFromRawData(roleBasePagePermissions as string[]);
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

            const roleType = getters.getCurrentRoleInfo?.roleType ?? 'USER';
            const roleBasePagePermissions = getters.getCurrentRoleInfo?.pageAccess ?? ['my_page.*'];
            // TODO: type of roleBasePagePermissions must be checked
            const pagePermissionMap = getPageAccessMapFromRawData(roleBasePagePermissions as string[]);
            const minimalPagePermissionList = getMinimalPageAccessPermissionList(roleType);

            // TODO: type of roleBasePagePermissions must be checked
            const isAllReadOnly = checkAllMenuReadonly(roleBasePagePermissions as string[]);

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
        isUserNeedPasswordReset: computed<boolean>(() => !!state.requiredActions?.includes('UPDATE_PASSWORD')),
    });

    /* Mutations */
    const setUserState = async (userInfo: UserState): Promise<void> => {
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

        if (userInfo.language) {
            await setI18nLocale(userInfo.language);
        }

        LocalStorageAccessor.setItem(STORAGE_KEY, state);
    };


    const setLanguage = (language: string): void => {
        state.language = language;
        LocalStorageAccessor.setItem(STORAGE_KEY, state);
    };

    const setTimezone = (timezone?: string): void => {
        state.timezone = timezone;
        LocalStorageAccessor.setItem(STORAGE_KEY, state);
    };

    const setCurrentGrantInfo = (currentGrantInfo?: GrantInfo): void => {
        state.currentGrantInfo = currentGrantInfo;
        LocalStorageAccessor.setItem(STORAGE_KEY, state);
    };
    const setCurrentRoleInfo = (currentRoleInfo?: RoleInfo): void => {
        state.currentRoleInfo = currentRoleInfo;
        LocalStorageAccessor.setItem(STORAGE_KEY, state);
    };
    const setIsSignInLoading = (isSignInLoading: boolean): void => {
        state.isSignInLoading = isSignInLoading;
        LocalStorageAccessor.setItem(STORAGE_KEY, state);
    };

    /* Actions */
    const getUserInfo = async (): Promise<Partial<UserState>> => {
        const response = await SpaceConnector.clientV2.identity.userProfile.get<UserGetParameters, UserModel>();
        // TODO: refactor below code with new response
        return {
            userId: response.user_id,
            roleType: response.role_type,
            authType: response.auth_type,
            name: response.name,
            email: response.email,
            language: response.language,
            timezone: response.timezone,
            requiredActions: response.required_actions,
            // email_verified : There is data only when the value is true.
            emailVerified: !!response.email_verified,
            mfa: response.mfa,
        };
    };

    const updateUser = async (userRequest: UpdateUserRequest): Promise<void> => {
        const request: UserProfileUpdateParameters = {};

        if (userRequest.name) request.name = userRequest.name;
        if (userRequest.name === '') request.name = ' '; // NOTE: discussed solution by detour way in case of name removal
        if (userRequest.password) request.password = userRequest.password;
        if (userRequest.email) request.email = userRequest.email;
        if (userRequest.language) request.language = userRequest.language;
        if (userRequest.timezone) request.timezone = userRequest.timezone;
        if (userRequest.tags) request.tags = userRequest.tags;

        await SpaceConnector.clientV2.identity.userProfile.update<UserProfileUpdateParameters>(request);
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


        const userInfo = await getUserInfo();
        setUserState(userInfo);
        setIsSessionExpired(false);
    };

    const signOut = (): void => {
        SpaceConnector.flushToken();
        setCurrentGrantInfo(undefined);
    };
    const getRoleTypeFromToken = (token: string): RoleType => {
        const decodedToken = jwtDecode<JWTPayload>(token);
        return decodedToken.rol;
    };
    const grantRoleAndLoadReferenceData = async (grantRequest: Omit<TokenGrantParameters, 'grant_type'>) => {
        const appContextStore = useAppContextStore();
        const userWorkspaceStore = useUserWorkspaceStore();
        const errorStore = useErrorStore();
        const fetcher = getCancellableFetcher(SpaceConnector.clientV2.identity.token.grant)<TokenGrantParameters, TokenGrantModel>;

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
                const grantInfo: GrantInfo = {
                    scope: grantRequest.scope,
                    workspaceId: grantRequest.workspace_id,
                    pageAccess: rootRoleInfo?.pageAccess as string[] || undefined,
                };
                setCurrentGrantInfo(grantInfo);

                const currentRoleInfo = await getGrantedRole(response.role_id, currentRoleType, response.role_type);
                setCurrentRoleInfo(currentRoleInfo);

                if (grantRequest.scope === 'DOMAIN') {
                    appContextStore.enterAdminMode();
                } else appContextStore.exitAdminMode();
                if (grantRequest.scope === 'WORKSPACE' && grantRequest.workspace_id) {
                    userWorkspaceStore.setCurrentWorkspace(grantRequest.workspace_id);
                    await setCurrentAccessedWorkspaceId(grantRequest.workspace_id);
                }
                if (grantRequest.scope === 'USER') userWorkspaceStore.setCurrentWorkspace();

                if (currentRoleInfo) {
                    const allReferenceStore = useAllReferenceStore();
                    allReferenceStore.flush();
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
            setCurrentGrantInfo(undefined);
            setCurrentRoleInfo(undefined);
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
    };

    const getRoleTypeByManagedRoleId = (roleId: string): RoleType => MANAGED_ROLES[roleId];

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
                roleType: getRoleTypeByManagedRoleId(roleId),
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

    const setIsSessionExpired = (isExpired?: boolean): void => {
        state.isSessionExpired = isExpired;
    };

    const setUser = async (userRequest: UpdateUserRequest): Promise<void> => {
        await updateUser(userRequest);

        const convertRequestType = (): UserState => ({
            userId: userRequest.user_id || state.userId,
            name: userRequest.name === undefined ? state.name : userRequest.name,
            email: userRequest.email || state.email,
            language: userRequest.language || state.language,
            timezone: userRequest.timezone || state.timezone,
            emailVerified: userRequest.email_verified !== undefined ? userRequest.email_verified : state.emailVerified,
            mfa: userRequest.mfa || state.mfa,
        });

        setUserState({ ...state, ...convertRequestType() });
        setTimezone(userRequest.timezone);
        if (userRequest.language) {
            setLanguage(userRequest.language);
            await setI18nLocale(userRequest.language);
        }
    };

    const startSignIn = () => {
        setIsSignInLoading(true);
    };

    const finishSignIn = () => {
        setIsSignInLoading(false);
    };

    const mutations = {
        setUserState,
        setLanguage,
        setTimezone,
        setCurrentGrantInfo,
        setCurrentRoleInfo,
        setIsSignInLoading,
    };
    const actions = {
        signIn,
        signOut,
        grantRoleAndLoadReferenceData,
        setIsSessionExpired,
        setUser,
        startSignIn,
        finishSignIn,
    };
    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
