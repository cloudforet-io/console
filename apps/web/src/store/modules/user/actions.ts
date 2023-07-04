import type { JwtPayload } from 'jwt-decode';
import jwtDecode from 'jwt-decode';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { setI18nLocale } from '@/translations';

import { languages } from '@/store/modules/user/config';

import type {
    UserState, SignInRequest, UpdateUserRequest, UserRole,
} from './type';

const getDomainOwnerInfo = async (ownerId: string): Promise<Partial<UserState>> => {
    const response = await SpaceConnector.client.identity.domainOwner.get({ owner_id: ownerId });
    return {
        userId: response.owner_id,
        userType: 'DOMAIN_OWNER',
        backend: 'LOCAL',
        name: response.name,
        email: response.email,
        language: languages[response.language] ? response.language : 'en',
        timezone: response.timezone,
        // email_verified : There is data only when the value is true.
        emailVerified: !!response.email_verified,
    };
};

const getUserInfo = async (userId: string): Promise<Partial<UserState>> => {
    const response = await SpaceConnector.client.identity.user.get({ user_id: userId });
    return {
        userId: response.user_id,
        userType: 'USER',
        backend: response.backend,
        name: response.name,
        email: response.email,
        language: response.language,
        timezone: response.timezone,
        requiredActions: response.required_actions,
        // email_verified : There is data only when the value is true.
        emailVerified: !!response.email_verified,
    };
};

const updateUser = async (userId: string, userType: string, userRequest: UpdateUserRequest): Promise<void> => {
    const request: any = {};

    if (userType === 'DOMAIN_OWNER') {
        request.owner_id = userId;
    } else {
        request.user_id = userId;
    }

    if (userRequest.name) request.name = userRequest.name;
    if (userRequest.password) request.password = userRequest.password;
    if (userRequest.email) request.email = userRequest.email;
    if (userRequest.language) request.language = userRequest.language;
    if (userRequest.timezone) request.timezone = userRequest.timezone;
    if (userRequest.tags) request.tags = userRequest.tags;

    if (userType === 'DOMAIN_OWNER') {
        await SpaceConnector.client.identity.domainOwner.update(request);
    } else {
        await SpaceConnector.clientV2.identity.user.update(request);
    }
};

interface JWTPayload extends JwtPayload {
    user_type: string
}
const getUserInfoFromToken = (token: string): string[] => {
    const decodedToken = jwtDecode<JWTPayload>(token);
    return [decodedToken.user_type, decodedToken.aud as string];
};

const getUserRoleBindings = async (userId: string): Promise<Array<UserRole>> => {
    try {
        const userRoles: Record<string, UserRole> = {};
        const { results } = await SpaceConnector.client.identity.roleBinding.list({
            resource_type: 'identity.User',
            resource_id: userId,
        });

        results.forEach((roleBindingInfo) => {
            const role = roleBindingInfo.role_info;
            const roleId = role.role_id;
            if (!userRoles[roleId]) {
                userRoles[roleId] = {
                    roleId,
                    name: role.name,
                    roleType: role.role_type,
                    pagePermissions: role.page_permissions,
                };
            }
        });

        return Object.values(userRoles);
    } catch (e) {
        console.error(`RoleBinding Load Error: ${e}`);
        return [];
    }
};

export const signIn = async ({ commit }, signInRequest: SignInRequest): Promise<void> => {
    const response = await SpaceConnector.client.identity.token.issue({
        domain_id: signInRequest.domainId,
        user_id: signInRequest.userId || null, // user_id is nullable
        user_type: signInRequest.userType,
        credentials: signInRequest.credentials,
    }, { skipAuthRefresh: true });
    SpaceConnector.setToken(response.access_token, response.refresh_token);

    const [userType, userId] = getUserInfoFromToken(response.access_token);

    if (userType === 'DOMAIN_OWNER') {
        const userInfo = await getDomainOwnerInfo(userId);
        commit('setUser', userInfo);
        commit('setRoles', [{ name: 'Root Account', roleType: 'DOMAIN' }]);
    } else {
        const userInfo = await getUserInfo(userId);
        commit('setUser', userInfo);

        const userRoles = await getUserRoleBindings(userId);
        commit('setRoles', userRoles);
    }

    commit('setIsSessionExpired', false);
};

export const signOut = (): void => {
    SpaceConnector.flushToken();
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
    });

    commit('setUser', { ...state, ...convertRequestType() });
    commit('setTimezone', userRequest.timezone);
    if (userRequest.language) {
        commit('setLanguage', userRequest.language);
        await setI18nLocale(userRequest.language);
    }
};

export const setTimezone = async ({ commit, state }, timezone: string): Promise<void> => {
    await updateUser(state.userId, state.userType, { timezone });
    commit('setTimezone', timezone);
};

export const setLanguage = async ({ commit, state }, language: string): Promise<void> => {
    await updateUser(state.userId, state.userType, { language });
    commit('setLanguage', language);
    await setI18nLocale(language);
};

export const getUser = async ({ commit, state }, userId): Promise<void> => {
    if (state.userType === 'DOMAIN_OWNER') {
        const userInfo = await getDomainOwnerInfo(userId);
        commit('setUser', userInfo);
    } else {
        const userInfo = await getUserInfo(userId);
        commit('setUser', userInfo);
    }
};
