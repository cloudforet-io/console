/* eslint-disable camelcase */

import jwt from 'jsonwebtoken';
import { SpaceConnector } from '@/lib/space-connector';
import {
    UserState, SignInRequest, UpdateUserRequest,
} from './type';

const getDomainOwner = async (ownerId: string): Promise<UserState> => {
    const response = await SpaceConnector.client.identity.domainOwner.get({ owner_id: ownerId });
    return {
        userId: response.owner_id,
        userType: 'DOMAIN_OWNER',
        language: response.language,
        timezone: response.timezone,
    };
};


const getUser = async (userId: string): Promise<UserState> => {
    const response = await SpaceConnector.client.identity.user.get({ user_id: userId });
    return {
        userId: response.user_id,
        userType: 'USER',
        language: response.language,
        timezone: response.timezone,
    };
};

const getReportState = async (): Promise<boolean> => {
    try {
        await SpaceConnector.client.report.domain.get();
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
    if (userRequest.mobile) request.mobile = userRequest.mobile;
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

export const signIn = async ({ commit, state }, signInRequest: SignInRequest): Promise<void> => {
    const response = await SpaceConnector.client.identity.token.issue(signInRequest);
    SpaceConnector.setToken(response.access_token, response.refresh_token);

    const [userType, userId] = getUserInfoFromToken(response.access_token);

    if (userType === 'DOMAIN_OWNER') {
        const userInfo = await getDomainOwner(userId);
        commit('setUser', userInfo);
    } else {
        const userInfo = await getUser(userId);
        commit('setUser', userInfo);
    }

    const reportState = await getReportState();
    commit('setReportState', reportState);
};

export const signOut = (): void => {
    SpaceConnector.flushToken();
};

export const setUser = async ({ commit, state }, userRequest: UpdateUserRequest): Promise<void> => {
    await updateUser(state.userId, state.userType, userRequest);
    commit('setTimezone', { timezone: userRequest.timezone });
    commit('setLanguage', { timezone: userRequest.language });
};

export const setTimezone = async ({ commit, state }, timezone: string): Promise<void> => {
    await updateUser(state.userId, state.userType, { timezone });
    commit('setTimezone', timezone);
};

export const setLanguage = async ({ commit, state }, language: string): Promise<void> => {
    await updateUser(state.userId, state.userType, { language });
    commit('setLanguage', language);
};
