import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';


import { DOMAIN_CONFIG_NAMES } from '@/api-clients/config/domain-config/schema/constant';
import type { ExtendedAuthType, ExtraMenuSet } from '@/api-clients/config/domain-config/schema/type';
import type {
    DomainGetAuthInfoParams,
    DomainGetAuthInfoResponse,
    Metadata,
} from '@/api-clients/identity/domain/schema/api-verbs/get-auth-info';

import type { Currency } from '@/store/display/type';

import config from '@/lib/config';


const extendedAuthTypes = {
    GOOGLE_OAUTH2: 'Google OAuth2',
    KEYCLOAK: 'Keycloak',
};
const getExtendedAuthType = (provider:Metadata['identity_provider'], protocol: Metadata['protocol']): ExtendedAuthType | undefined => {
    if (protocol === 'saml') {
        return 'SAML';
    }
    if (provider && protocol) {
        return `${provider.toUpperCase()}_${protocol.toUpperCase()}` as ExtendedAuthType;
    }
    return undefined;
};

export const useDomainStore = defineStore('domain-store', () => {
    const state = reactive({
        domainId: '' as string,
        name: '' as string,
        extendedAuthType: undefined as ExtendedAuthType|undefined,
        authOptions: undefined as Record<string, any>|undefined,
        extraMenu: undefined as ExtraMenuSet|undefined,
        config: undefined as Record<string, any>|undefined,
    });
    const getters = reactive({
        extendedAuthTypeLabel: computed<string>(() => {
            const idpName = state.authOptions?.idp_name?.replace('Sign In with ', '');
            return extendedAuthTypes[state.extendedAuthType as string] || (`${state.extendedAuthType} (${idpName})`);
        }),
        domainExtraMenu: computed(() => state.config?.settings?.[DOMAIN_CONFIG_NAMES.EXTRA_MENU]),
        domainSymbolImage: computed<string|undefined>(() => {
            const domainSettings = state.config?.settings;
            if (domainSettings?.symbol_favicon_url) return domainSettings.symbol_favicon_url;

            const configImage = config.get('DOMAIN_IMAGE.CI_LOGO');
            if (configImage) return configImage;

            return undefined;
        }),
        domainWordTypeLogoImage: computed<string|undefined>(() => {
            const domainSettings = state.config?.settings;
            if (domainSettings?.wordtype_logo_url) return domainSettings?.wordtype_logo_url;

            const configImage = config.get('DOMAIN_IMAGE.CI_TEXT_WITH_TYPE');
            if (configImage) return configImage;

            return undefined;
        }),
        domainSignInImage: computed<string|undefined>(() => {
            const domainSettings = state.config?.settings;
            if (domainSettings?.login_page_image_url) return domainSettings?.login_page_image_url;

            const configImage = config.get('DOMAIN_IMAGE.SIGN_IN');
            if (configImage) return configImage;

            return undefined;
        }),
        domainDisplayName: computed<string|undefined>(() => {
            const domainSettings = state.config?.settings;
            if (domainSettings?.display_name) return domainSettings?.display_name;

            return undefined;
        }),
        domainUnifiedCostCurrency: computed<Currency|undefined>(() => state.config?.settings?.unified_cost_config?.currency),
    });

    /* Mutation */
    const setDomainConfig = (_config?: Record<string, any>): void => {
        state.config = _config;
    };

    /* Action */
    const initDomainInfo = async (name: string): Promise<void|Error> => {
        const response = await SpaceConnector.clientV2.identity.domain.getAuthInfo<DomainGetAuthInfoParams, DomainGetAuthInfoResponse>({ name });

        if (response.domain_id) {
            const authMetadata = response.metadata;
            state.domainId = response.domain_id;
            state.name = response.name;
            state.authOptions = authMetadata;
            state.extendedAuthType = getExtendedAuthType(authMetadata.identity_provider, authMetadata.protocol);
            state.config = response.config;
        } else {
            throw new Error(`Can not find '${name}' domain.`);
        }
    };

    const mutations = {
        setDomainConfig,
    };
    const actions = {
        initDomainInfo,
    };
    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
