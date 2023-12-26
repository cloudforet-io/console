import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { DomainConfigCreateParameters } from '@/schema/config/domain-config/api-verbs/create';
import type { DomainConfigListParameters } from '@/schema/config/domain-config/api-verbs/list';
import type { DomainConfigUpdateParameters } from '@/schema/config/domain-config/api-verbs/update';
import type { DomainConfigModel } from '@/schema/config/domain-config/model';

import { DOMAIN_CONFIG_TYPE } from '@/store/modules/domain/type';

import ErrorHandler from '@/common/composables/error/errorHandler';


interface DomainSettingsData {
    display_name?: string;
    admin_email?: string;
    timezone?: string;
    language?: string;
    wordtype_logo_url?: string;
    symbol_favicon_url?: string;
    login_page_image_url?: string;
}

export const useDomainSettingsStore = defineStore('domain-config', () => {
    const state = reactive({
        domainConfig: null as null|DomainConfigModel<DomainSettingsData>,
    });

    const getters = reactive({
        displayName: computed<string|undefined>(() => state.domainConfig?.data?.display_name),
        adminEmail: computed<string|undefined>(() => state.domainConfig?.data?.admin_email),
        timezone: computed<string|undefined>(() => state.domainConfig?.data?.timezone),
        language: computed<string|undefined>(() => state.domainConfig?.data?.language),
        wordtypeLogoUrl: computed<string|undefined>(() => state.domainConfig?.data?.wordtype_logo_url),
        symbolFaviconUrl: computed<string|undefined>(() => state.domainConfig?.data?.symbol_favicon_url),
        loginPageImageUrl: computed<string|undefined>(() => state.domainConfig?.data?.login_page_image_url),
    });

    /* Actions */
    const fetchDomainSettings = async () => {
        try {
            const res = await SpaceConnector.client.config.domainConfig.list<DomainConfigListParameters, ListResponse<DomainConfigModel>>({
                name: DOMAIN_CONFIG_TYPE.SETTINGS,
            });
            state.domainConfig = res.results?.[0] ?? null;
        } catch (e) {
            ErrorHandler.handleError(e);
            state.domainConfig = null;
        }
    };
    const createDomainSettings = async (data: DomainSettingsData) => {
        try {
            state.domainConfig = await SpaceConnector.client.config.domainConfig.create<DomainConfigCreateParameters, DomainConfigModel>({
                name: DOMAIN_CONFIG_TYPE.SETTINGS,
                data,
            });
        } catch (e) {
            ErrorHandler.handleError(e);
            throw e;
        }
    };
    const updateDomainSettings = async (data: DomainSettingsData) => {
        if (!state.domainConfig) {
            await createDomainSettings(data);
            return;
        }
        try {
            state.domainConfig = await SpaceConnector.client.config.domainConfig.update<DomainConfigUpdateParameters, DomainConfigModel>({
                name: DOMAIN_CONFIG_TYPE.SETTINGS,
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
        fetchDomainSettings,
        updateDomainSettings,
    };

    return {
        state,
        getters,
        ...actions,
    };
});
