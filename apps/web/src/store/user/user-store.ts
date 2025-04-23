import { computed, reactive, watch } from 'vue';

import { defineStore } from 'pinia';

import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import type { UserProfileUpdateParameters } from '@/api-clients/identity/user-profile/schema/api-verbs/update';
import type { UserModel, UserMfa } from '@/api-clients/identity/user/schema/model';
import { setI18nLocale } from '@/translations';

import { languages, USER_STORAGE_KEY } from '@/store/user/constant';
import type {
    UserStoreGetters,
    UserStoreState,
} from '@/store/user/type';


export const useUserStore = defineStore('user-store', () => {
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
        requiredActions: storedUserState.requiredActions,
        emailVerified: storedUserState.emailVerified,
        isSignInLoading: false,
        mfa: storedUserState.mfa,
    });
    const getters = reactive<UserStoreGetters>({
        isDomainAdmin: computed<boolean>(() => state.roleType === ROLE_TYPE.DOMAIN_ADMIN),
        isSystemAdmin: computed<boolean>(() => state.roleType === ROLE_TYPE.SYSTEM_ADMIN),
        languageLabel: computed<string>(() => languages[state.language as string] || state.language),
        hasAdminOrWorkspaceOwnerRole: computed<boolean>(() => state.roleType === 'DOMAIN_ADMIN' || state.roleType === 'WORKSPACE_OWNER'),
    });

    /* Mutations */
    const setIsSessionExpired = (val: boolean) => { state.isSessionExpired = val; };
    const setLanguage = (val: string) => { state.language = val; };
    const setTimezone = (val: string) => { state.timezone = val; };
    const setIsSignInLoading = (val: boolean) => { state.isSignInLoading = val; };
    const setEmailVerified = (val: boolean) => { state.emailVerified = val; };
    const setMfa = (val: UserMfa) => { state.mfa = val; };
    const setEmail = (val: string) => { state.email = val; };
    const setUserId = (val: string) => { state.userId = val; };
    const mutations = {
        setIsSessionExpired,
        setLanguage,
        setTimezone,
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

        if (userInfo.language) {
            await setI18nLocale(userInfo.language);
        }
    };
    const getUserInfo = async (): Promise<void> => {
        const response = await SpaceConnector.clientV2.identity.userProfile.get<
        undefined,
        UserModel
      >();
        setUserInfo({
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
            isSessionExpired: false,
        });
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
        getUserInfo,
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
