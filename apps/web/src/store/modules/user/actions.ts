import type { Action } from 'vuex';

import type { JwtPayload } from 'jwt-decode';
import jwtDecode from 'jwt-decode';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { RoleGetParameters } from '@/schema/identity/role/api-verbs/get';
import type { RoleListParameters } from '@/schema/identity/role/api-verbs/list';
import { MANAGED_ROLE_TYPE, ROLE_TYPE } from '@/schema/identity/role/constant';
import type { RoleModel } from '@/schema/identity/role/model';
import type { TokenGrantParameters } from '@/schema/identity/token/api-verbs/grant';
import type { TokenTokenParameters } from '@/schema/identity/token/api-verbs/token';
import type { GrantScope } from '@/schema/identity/token/type';
import type { UserGetParameters } from '@/schema/identity/user/api-verbs/get';
import type { UserModel } from '@/schema/identity/user/model';
import { setI18nLocale } from '@/translations';

import type { PagePermission } from '@/lib/access-control/config';

import type {
    UserState, SignInRequest, UpdateUserRequest, UserRole, RoleInfo,
} from './type';


const getUserInfo = async (userId: string, domainId: string): Promise<Partial<UserState>> => {
    const response = await SpaceConnector.clientV2.identity.user.get<UserGetParameters, UserModel>({
        user_id: userId,
        domain_id: domainId,
    });
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

const updateUser = async (userId: string, userType: string, userRequest: UpdateUserRequest): Promise<void> => {
    const request: any = {};
    request.user_id = userId;

    if (userRequest.name) request.name = userRequest.name;
    if (userRequest.password) request.password = userRequest.password;
    if (userRequest.email) request.email = userRequest.email;
    if (userRequest.language) request.language = userRequest.language;
    if (userRequest.timezone) request.timezone = userRequest.timezone;
    if (userRequest.tags) request.tags = userRequest.tags;

    await SpaceConnector.clientV2.identity.user.update(request);
};

interface JWTPayload extends JwtPayload {
    user_type: string
}
const getUserInfoFromToken = (token: string): string[] => {
    const decodedToken = jwtDecode<JWTPayload>(token);
    return [decodedToken.user_type, decodedToken.aud as string];
};

// TODO: will be deprecated with grant API
const getUserRoles = async (domainId: string): Promise<Array<UserRole>> => {
    try {
        const userRoles: Record<string, UserRole> = {};
        const { results } = await SpaceConnector.clientV2.identity.role.list<RoleListParameters>({
            domain_id: domainId, // TODO: delete after backend is ready
        });

        if (!results) return [];

        // TODO: refactor below logic with new response
        results.forEach((role) => {
            const roleId = role.role_id;
            const isManagedRole = roleId.startsWith('managed-');
            if (!userRoles[roleId]) {
                userRoles[roleId] = {
                    roleId,
                    name: role.name,
                    roleType: role.role_type,
                    pagePermissions: isManagedRole ? generatePagePermissionsForManagedRole(roleId) : role.page_permissions,
                };
            }
        });

        return Object.values(userRoles);
    } catch (e) {
        console.error(`RoleBinding Load Error: ${e}`);
        return [];
    }
};

const getUserRole = async (roleId: string): Promise<RoleInfo|undefined> => {
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

// TODO: need to implementation with default permissino of managed role
const generatePagePermissionsForManagedRole = (roleId: string): PagePermission[] => {
    if (roleId === MANAGED_ROLE_TYPE[ROLE_TYPE.DOMAIN_ADMIN]) {
        return [{ page: '*', permission: 'MANAGE' }];
    } if (roleId === MANAGED_ROLE_TYPE[ROLE_TYPE.WORKSPACE_OWNER]) {
        return [{ page: '*', permission: 'MANAGE' }];
    } if (roleId === MANAGED_ROLE_TYPE[ROLE_TYPE.WORKSPACE_MEMBER]) {
        return [{ page: '*', permission: 'VIEW' }];
    } return [];
};

export const signIn = async ({ commit }, signInRequest: SignInRequest): Promise<void> => {
    const domainId = signInRequest.domainId;
    const response = await SpaceConnector.clientV2.identity.token.issue<TokenTokenParameters>({
        domain_id: domainId,
        auth_type: signInRequest.authType,
        credentials: signInRequest.credentials,
        verify_code: signInRequest.verify_code,
    }, { skipAuthRefresh: true });

    SpaceConnector.setToken(response.access_token, response.refresh_token);

    const [, userId] = getUserInfoFromToken(response.access_token);

    const userInfo = await getUserInfo(userId, domainId);
    commit('setUser', userInfo);

    // TODO: refactor with role grant API
    const userRoles = await getUserRoles(domainId);
    commit('setRoles', userRoles);

    commit('setIsSessionExpired', false);
};

export const signOut = (): void => {
    SpaceConnector.flushToken();
};

export const grantRole: Action<UserState, any> = async ({ commit }, grantScope: GrantScope, workspace_id?: string) => {
    const accessToekn = 'access token';
    const response = await SpaceConnector.clientV2.identity.token.grant<TokenGrantParameters>({
        grant_type: 'API_KEY',
        scope: grantScope,
        token: accessToekn,
        workspace_id,
    }, { skipAuthRefresh: true });

    SpaceConnector.setToken(response.access_token);
    const [, userId] = getUserInfoFromToken(response.access_token);


    const roleInfo = await getUserRole(userId);
    commit('setCurrentRoleInfo', roleInfo);
};

export const setIsSessionExpired = ({ commit }, isExpired?: boolean): void => {
    commit('setIsSessionExpired', isExpired);
};

export const setUser = async ({ commit, state }, userRequest: UpdateUserRequest): Promise<void> => {
    await updateUser(state.userId, state.userType, userRequest);

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
