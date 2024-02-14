import type { Getter } from 'vuex';

import { extendedAuthTypes } from '@/store/modules/domain/config';

import config from '@/lib/config';

import type { DomainState } from './type';
import { DOMAIN_CONFIG_TYPE } from './type';


export const extendedAuthTypeLabel = (state: DomainState): string => extendedAuthTypes[state.extendedAuthType as string] || state.extendedAuthType;

export const domainExtraMenu: Getter<DomainState, any> = (state): any => state.config?.settings?.[DOMAIN_CONFIG_TYPE.EXTRA_MENU];

export const domainSymbolImage: Getter<DomainState, any> = (state): string|undefined => {
    const domainSettings = state.config?.settings;
    if (domainSettings?.symbol_favicon_url) return domainSettings.symbol_favicon_url;

    const configImage = config.get('DOMAIN_IMAGE.CI_LOGO');
    if (configImage) return configImage;

    return undefined;
};

export const domainWordTypeLogoImage: Getter<DomainState, any> = (state): string|undefined => {
    const domainSettings = state.config?.settings;
    if (domainSettings?.wordtype_logo_url) return domainSettings?.wordtype_logo_url;

    const configImage = config.get('DOMAIN_IMAGE.CI_TEXT_WITH_TYPE');
    if (configImage) return configImage;

    return undefined;
};

export const domainSignInImage: Getter<DomainState, any> = (state): string|undefined => {
    const domainSettings = state.config?.settings;
    if (domainSettings?.login_page_image_url) return domainSettings?.login_page_image_url;

    const configImage = config.get('DOMAIN_IMAGE.SIGN_IN');
    if (configImage) return configImage;

    return undefined;
};

export const domainDisplayName: Getter<DomainState, any> = (state): string|undefined => {
    const domainSettings = state.config?.settings;
    if (domainSettings?.display_name) return domainSettings?.display_name;

    return undefined;
};
