import type { DomainState, ExtraMenuSet } from './type';
import { DOMAIN_CONFIG_TYPE } from './type';

export const setDomain = (state: DomainState, domainInfo: DomainState): void => {
    state.domainId = domainInfo.domainId;
    state.name = domainInfo.name;
    state.authOptions = domainInfo.authOptions;
    state.extendedAuthType = domainInfo.extendedAuthType;
};

export const setBillingEnabled = (state: DomainState, billingEnabled: boolean) => {
    state.billingEnabled = billingEnabled;
};

export const setExtraMenus = (state: DomainState, extraMenus: ExtraMenuSet | undefined) => {
    state.domainConfig[DOMAIN_CONFIG_TYPE.EXTRA_MENU] = extraMenus;
};
