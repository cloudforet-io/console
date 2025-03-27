import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { DomainConfigCreateParameters } from '@/api-clients/config/domain-config/schema/api-verbs/create';
import type { DomainConfigListParameters } from '@/api-clients/config/domain-config/schema/api-verbs/list';
import type { DomainConfigUpdateParameters } from '@/api-clients/config/domain-config/schema/api-verbs/update';
import { DOMAIN_CONFIG_NAMES } from '@/api-clients/config/domain-config/schema/constant';
import type { DomainConfigModel } from '@/api-clients/config/domain-config/schema/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { PreferencesData, UnifiedCostConfig } from '@/services/advanced/types/preferences-type';

export const useDomainConfigStore = defineStore('domain-config', () => {
    const state = reactive({
        domainConfig: null as null|DomainConfigModel<PreferencesData>,
    });

    const getters = reactive({
        displayName: computed<string|undefined>(() => state.domainConfig?.data?.display_name),
        adminEmail: computed<string|undefined>(() => state.domainConfig?.data?.admin_email),
        timezone: computed<string|undefined>(() => state.domainConfig?.data?.timezone),
        language: computed<string|undefined>(() => state.domainConfig?.data?.language),
        wordtypeLogoUrl: computed<string|undefined>(() => state.domainConfig?.data?.wordtype_logo_url),
        symbolFaviconUrl: computed<string|undefined>(() => state.domainConfig?.data?.symbol_favicon_url),
        loginPageImageUrl: computed<string|undefined>(() => state.domainConfig?.data?.login_page_image_url),
        unifiedCostConfig: computed<UnifiedCostConfig|undefined>(() => state.domainConfig?.data?.unified_cost_config),
    });

    /* Actions */
    const fetchPreferences = async () => {
        try {
            const res = await SpaceConnector.client.config.domainConfig.list<DomainConfigListParameters, ListResponse<DomainConfigModel>>({
                name: DOMAIN_CONFIG_NAMES.SETTINGS,
            });
            state.domainConfig = res.results?.[0] ?? null;
        } catch (e) {
            ErrorHandler.handleError(e);
            state.domainConfig = null;
        }
    };
    const createPreferences = async (data: PreferencesData) => {
        try {
            state.domainConfig = await SpaceConnector.client.config.domainConfig.create<DomainConfigCreateParameters, DomainConfigModel>({
                name: DOMAIN_CONFIG_NAMES.SETTINGS,
                data,
            });
        } catch (e) {
            ErrorHandler.handleError(e);
            throw e;
        }
    };
    const updatePreferences = async (data: PreferencesData) => {
        if (!state.domainConfig) {
            await createPreferences(data);
            return;
        }
        try {
            state.domainConfig = await SpaceConnector.client.config.domainConfig.update<DomainConfigUpdateParameters, DomainConfigModel>({
                name: DOMAIN_CONFIG_NAMES.SETTINGS,
                data: {
                    ...state.domainConfig.data,
                    ...data,
                },
            });
        } catch (e) {
            ErrorHandler.handleError(e);
            throw e;
        }
    };

    const actions = {
        fetchPreferences,
        updatePreferences,
    };

    return {
        state,
        getters,
        ...actions,
    };
});
