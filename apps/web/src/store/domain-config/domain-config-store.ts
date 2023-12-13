import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { CreateDomainConfigParameters } from '@/schema/config/domain-config/api-verbs/create';
import type { GetDomainConfigParameters } from '@/schema/config/domain-config/api-verbs/get';
import type { UpdateDomainConfigParameters } from '@/schema/config/domain-config/api-verbs/update';
import type { DomainConfigModel } from '@/schema/config/domain-config/model';

import { DOMAIN_CONFIG_TYPE } from '@/store/modules/domain/type';

import ErrorHandler from '@/common/composables/error/errorHandler';


interface DomainConfigData {
    display_name?: string;
    admin_email?: string;
    timezone?: string;
    language?: string;
    wordtype_logo_url?: string;
    symbol_favicon_url?: string;
    login_page_image_url?: string;
}

export const useDomainConfigStore = defineStore('domain-config', () => {
    const state = reactive({
        domainConfig: null as null|DomainConfigModel<DomainConfigData>,
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
    const fetchDomainConfig = async () => {
        try {
            state.domainConfig = await SpaceConnector.client.config.domainConfig.get<GetDomainConfigParameters, DomainConfigModel>();
        } catch (e) {
            ErrorHandler.handleError(e);
            state.domainConfig = null;
        }
    };
    const createDomainConfig = async (data: DomainConfigData) => {
        try {
            state.domainConfig = await SpaceConnector.client.config.domainConfig.create<CreateDomainConfigParameters, DomainConfigModel>({
                name: DOMAIN_CONFIG_TYPE.SETTINGS,
                data,
            });
        } catch (e) {
            ErrorHandler.handleError(e);
            throw e;
        }
    };
    const updateDomainConfig = async (data: DomainConfigData) => {
        if (!state.domainConfig) {
            await createDomainConfig(data);
            return;
        }
        try {
            state.domainConfig = await SpaceConnector.client.config.domainConfig.update<UpdateDomainConfigParameters, DomainConfigModel>({
                name: DOMAIN_CONFIG_TYPE.SETTINGS,
                data,
            });
        } catch (e) {
            ErrorHandler.handleError(e);
            throw e;
        }
    };

    const actions = {
        fetchDomainConfig,
        updateDomainConfig,
    };

    return {
        state,
        getters,
        ...actions,
    };
});
