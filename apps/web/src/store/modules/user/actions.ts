import type { Action } from 'vuex';

import jwtDecode from 'jwt-decode';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
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
import { MANAGED_ROLES } from '@/store/modules/user/config';

import { setCurrentAccessedWorkspaceId } from '@/lib/site-initializer/last-accessed-workspace';

import type {
    UserState, SignInRequest, UpdateUserRequest, RoleInfo,
} from './type';

interface JWTPayload {
    rol: RoleType;
}


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

const updateUser = async (userType: string, userRequest: UpdateUserRequest): Promise<void> => {
    const request: any = {};

    if (userRequest.name) request.name = userRequest.name;
    if (userRequest.password) request.password = userRequest.password;
    if (userRequest.email) request.email = userRequest.email;
    if (userRequest.language) request.language = userRequest.language;
    if (userRequest.timezone) request.timezone = userRequest.timezone;
    if (userRequest.tags) request.tags = userRequest.tags;

    await SpaceConnector.clientV2.identity.userProfile.update<UserProfileUpdateParameters>(request);
};

export const signIn = async ({ commit }, signInRequest: SignInRequest): Promise<void> => {
    const domainId = signInRequest.domainId;
    const response = await SpaceConnector.clientV2.identity.token.issue<TokenIssueParameters, TokenIssueModel>({
        domain_id: domainId,
        auth_type: signInRequest.authType,
        credentials: signInRequest.credentials,
        verify_code: signInRequest.verify_code,
    }, { skipAuthRefresh: true });

    SpaceConnector.setToken(response.access_token, response.refresh_token);

    const userInfo = await getUserInfo();
    commit('setUser', userInfo);

    commit('setIsSessionExpired', false);
};

export const signOut = (): void => {
    SpaceConnector.flushToken();
};
const getRoleTypeFromToken = (token: string): RoleType => {
    const decodedToken = jwtDecode<JWTPayload>(token);
    return decodedToken.rol;
};
export const grantRole: Action<UserState, any> = async ({ commit }, grantRequest: Omit<TokenGrantParameters, 'grant_type'>) => {
    const appContextStore = useAppContextStore();
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

            const grantInfo = {
                scope: grantRequest.scope,
                workspaceId: grantRequest.workspace_id,
            };
            commit('setCurrentGrantInfo', grantInfo);

            const roleInfo = await getGrantedRole(response.role_id, currentRoleType, response.role_type);
            commit('setCurrentRoleInfo', roleInfo);

            if (grantRequest.scope === 'WORKSPACE' && grantRequest.workspace_id) {
                await setCurrentAccessedWorkspaceId(grantRequest.workspace_id);
            }
        }
    } catch (error) {
        /*
        * Unlike other cases where the ErrorHandler is used for error handling,
        * in the grant logic scenario, there can be instances where the Router
        * has not been initialized yet. Using the ErrorHandler in such situations
        * can lead to issues since it internally relies on the router.
        * Therefore, in this specific case, errors are simply logged to the console
        * and not further processed, to avoid complications with uninitialized Router instances.
        * */
        commit('setCurrentGrantInfo', undefined);
        commit('setCurrentRoleInfo', undefined);
        if (isInstanceOfAPIError(error)) {
            if (error.code === 'ERROR_WORKSPACE_STATE') {
                commit('error/setGrantAccessFailStatus', true, { root: true });
            } else if (error.code === 'ERROR_NOT_FOUND') {
                commit('error/setGrantAccessFailStatus', true, { root: true });
            } else if (error.code === 'ERROR_PERMISSION_DENIED') {
                commit('error/setGrantAccessFailStatus', true, { root: true });
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

const getGrantedRole = async (roleId: string, currentRoleType: RoleType, baseRoleType: RoleType): Promise<RoleInfo|undefined> => {
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

export const setIsSessionExpired = ({ commit }, isExpired?: boolean): void => {
    commit('setIsSessionExpired', isExpired);
};

export const setUser = async ({ commit, state }, userRequest: UpdateUserRequest): Promise<void> => {
    await updateUser(state.userType, userRequest);

    const convertRequestType = (): UserState => ({
        userId: userRequest.user_id || state.userId,
        name: userRequest.name || state.name,
        email: userRequest.email || state.email,
        language: userRequest.language || state.language,
        timezone: userRequest.timezone || state.timezone,
        emailVerified: userRequest.email_verified !== undefined ? userRequest.email_verified : state.emailVerified,
        mfa: userRequest.mfa || state.mfa,
    });

    commit('setUser', { ...state, ...convertRequestType() });
    commit('setTimezone', userRequest.timezone);
    if (userRequest.language) {
        commit('setLanguage', userRequest.language);
        await setI18nLocale(userRequest.language);
    }
};

export const startSignIn = ({ commit }) => {
    commit('setIsSignInLoading', true);
};

export const finishSignIn = ({ commit }) => {
    commit('setIsSignInLoading', false);
};
