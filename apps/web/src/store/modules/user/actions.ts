import type { Action } from 'vuex';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { RoleGetParameters } from '@/schema/identity/role/api-verbs/get';
import { MANAGED_ROLE_TYPE, ROLE_TYPE } from '@/schema/identity/role/constant';
import type { RoleModel } from '@/schema/identity/role/model';
import type { TokenGrantParameters } from '@/schema/identity/token/api-verbs/grant';
import type { TokenIssueParameters } from '@/schema/identity/token/api-verbs/issue';
import type { TokenGrantModel, TokenIssueModel } from '@/schema/identity/token/model';
import type { UserGetParameters } from '@/schema/identity/user/api-verbs/get';
import type { UserModel } from '@/schema/identity/user/model';
import { setI18nLocale } from '@/translations';

import { MENU_ID } from '@/lib/menu/config';

import type {
    UserState, SignInRequest, UpdateUserRequest, RoleInfo,
} from './type';


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

const getGrantedRole = async (roleId: string): Promise<RoleInfo|undefined> => {
    try {
        const response = await SpaceConnector.clientV2.identity.role.get<RoleGetParameters, RoleModel>({
            role_id: roleId,
        });

        const isManagedRole = roleId.startsWith('managed-');
        return {
            roleType: response.role_type,
            roleId: response.role_id,
            pageAccess: isManagedRole ? generatePageAccessForManagedRole(roleId) : response.page_access,
        };
    } catch (e) {
        console.error(`Role Load Error: ${e}`);
        return undefined;
    }
};

const generatePageAccessForManagedRole = (roleId: string): string[] => {
    if (roleId === MANAGED_ROLE_TYPE[ROLE_TYPE.DOMAIN_ADMIN]) {
        return ['*'];
    } if (roleId === MANAGED_ROLE_TYPE[ROLE_TYPE.WORKSPACE_OWNER]) {
        return [
            MENU_ID.HOME_DASHBOARD,
            `${MENU_ID.DASHBOARDS}.*`,
            `${MENU_ID.PROJECT}.*`,
            `${MENU_ID.ASSET_INVENTORY}.*`,
            `${MENU_ID.COST_EXPLORER}.*`,
            `${MENU_ID.ALERT_MANAGER}.*`,
            `${MENU_ID.ADMINISTRATION}.${MENU_ID.IAM}.${MENU_ID.USER}`,
            `${MENU_ID.ADMINISTRATION}.${MENU_ID.IAM}.${MENU_ID.APP}`,
            `${MENU_ID.MY_PAGE}.*`,
            `${MENU_ID.INFO}.*`,
        ];
    } if (roleId === MANAGED_ROLE_TYPE[ROLE_TYPE.WORKSPACE_MEMBER]) {
        return [
            MENU_ID.HOME_DASHBOARD,
            `${MENU_ID.DASHBOARDS}.*`,
            `${MENU_ID.PROJECT}.*`,
            `${MENU_ID.ASSET_INVENTORY}.${MENU_ID.CLOUD_SERVICE}`,
            `${MENU_ID.ASSET_INVENTORY}.${MENU_ID.SERVER}`,
            `${MENU_ID.ASSET_INVENTORY}.${MENU_ID.SERVICE_ACCOUNT}`,
            `${MENU_ID.COST_EXPLORER}.*`,
            `${MENU_ID.ALERT_MANAGER}.*`,
            `${MENU_ID.MY_PAGE}.*`,
            `${MENU_ID.INFO}.*`,
        ];
    } return [];
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

export const grantRole: Action<UserState, any> = async ({ commit }, grantRequest: Omit<TokenGrantParameters, 'grant_type'>) => {
    try {
        const response = await SpaceConnector.clientV2.identity.token.grant<TokenGrantParameters, TokenGrantModel>({
            grant_type: 'API_KEY',
            scope: grantRequest.scope,
            token: grantRequest.token,
            workspace_id: grantRequest.workspace_id,
        }, { skipAuthRefresh: true });

        SpaceConnector.setToken(response.access_token);

        const roleInfo = await getGrantedRole(response.role_id);
        commit('setCurrentRoleInfo', roleInfo);
    } catch (e) {
        throw new Error(`Role Grant Error: ${e}`);
    }
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
