import { reactive } from 'vue';

import { defineStore } from 'pinia';

import { ACCOUNT_TYPE } from '@/api-clients/identity/service-account/schema/constant';
import type { AccountType } from '@/api-clients/identity/service-account/schema/type';

export const useServiceAccountSchemaStore = defineStore('service-account-schema', () => {
    const state = reactive({
        selectedAccountType: ACCOUNT_TYPE.GENERAL as AccountType,
        currentProvider: undefined as string|undefined,
    });

    const mutations = {
        setCurrentProvider: (provider: string) => {
            state.currentProvider = provider;
        },
        setSelectedAccountType: (accountType: AccountType) => {
            state.selectedAccountType = accountType;
        },
    };

    return {
        state,
        ...mutations,
    };
});
