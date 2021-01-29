/* eslint-disable camelcase */

import jwt from 'jsonwebtoken';
import { SpaceConnector } from '@/lib/space-connector';
import {
    UserState, SignInRequest, UpdateUserRequest, UserRole
} from './type';

const getDomainOwnerInfo = async (ownerId: string): Promise<UserState> => {
    const response = await SpaceConnector.client.identity.domainOwner.get({ owner_id: ownerId });
    return {
        userId: response.owner_id,
        userType: 'DOMAIN_OWNER',
        backend: 'LOCAL',
        name: response.name,
        email: response.email,
        language: response.language,
        timezone: response.timezone,
    };
};


const getUserInfo = async (userId: string): Promise<UserState> => {
    const response = await SpaceConnector.client.identity.user.get({ user_id: userId });
    return {
        userId: response.user_id,
        userType: 'USER',
        backend: response.backend,
        name: response.name,
        email: response.email,
        language: response.language,
        timezone: response.timezone,
    };
};

const getReportState = async (): Promise<boolean> => {
    return false;
    // try {
    //     await SpaceConnector.client.report.domain.get();
    //     return true;
    // } catch (e) {
    //     return false;
    // }
};

const getPowerSchedulerState = async (): Promise<boolean> => {
    try {
        await SpaceConnector.client.powerScheduler.domain.get();
        return true;
    } catch (e) {
        return false;
    }
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
        await SpaceConnector.client.identity.user.update(request);
    }
};

const getUserInfoFromToken = (token: string): [string, string] => {
    const decodedToken = jwt.decode(token);
    return [decodedToken.user_type, decodedToken.aud];
};

const getUserRoleBindings = async (userId: string): Promise<Array<UserRole>> => {
    try {
        const userRoles: Array<UserRole> = [];
        const userRoleIds: Array<string> = [];
        const response = await SpaceConnector.client.identity.roleBinding.list({
            resource_type: 'identity.User',
            resource_id: userId,
        });

        response.results.forEach((roleBindingInfo) => {
            const role = roleBindingInfo.role_info;
            if (userRoleIds.indexOf(role.role_id) < 0) {
                userRoles.push({
                    roleId: role.role_id,
                    name: role.name,
                    roleType: role.role_type,
                });
                userRoleIds.push(role.role_id);
            }
        });

        return userRoles;
    } catch (e) {
        console.log(`RoleBinding Load Error: ${e}`);
        return [];
    }
};

export const signIn = async ({ commit, state }, signInRequest: SignInRequest): Promise<void> => {
    const response = await SpaceConnector.client.identity.token.issue({
        domain_id: signInRequest.domainId,
        user_id: signInRequest.userId,
        user_type: signInRequest.userType,
        credentials: signInRequest.credentials,
    }, { skipAuthRefresh: true });
    SpaceConnector.setToken(response.access_token, response.refresh_token);

    const [userType, userId] = getUserInfoFromToken(response.access_token);

    if (userType === 'DOMAIN_OWNER') {
        const userInfo = await getDomainOwnerInfo(userId);
        commit('setUser', userInfo);
        commit('setRoles', [{ name: 'Administrator', roleType: 'DOMAIN' }]);
    } else {
        const userInfo = await getUserInfo(userId);
        commit('setUser', userInfo);

        const userRoles = await getUserRoleBindings(userId);
        commit('setRoles', userRoles);
    }

    const reportState = await getReportState();
    commit('setReportState', reportState);

    const powerSchedulerState = await getPowerSchedulerState();
    commit('setPowerSchedulerState', powerSchedulerState);

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
    commit('setTimezone', userRequest.timezone);
    commit('setLanguage', userRequest.language);
};

export const setTimezone = async ({ commit, state }, timezone: string): Promise<void> => {
    await updateUser(state.userId, state.userType, { timezone });
    commit('setTimezone', timezone);
};

export const setLanguage = async ({ commit, state }, language: string): Promise<void> => {
    await updateUser(state.userId, state.userType, { language });
    commit('setLanguage', language);
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
