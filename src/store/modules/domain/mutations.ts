import type { DomainState, DomainConfigModel } from './type';

export const setDomain = (state: DomainState, domainInfo: DomainState): void => {
    state.domainId = domainInfo.domainId;
    state.name = domainInfo.name;
    state.authOptions = domainInfo.authOptions;
    state.extendedAuthType = domainInfo.extendedAuthType;
};

export const setBillingEnabled = (state: DomainState, billingEnabled: boolean) => {
    state.billingEnabled = billingEnabled;
};

export const setDomainConfig = (state: DomainState, domainConfig: DomainConfigModel|undefined) => {
    if (domainConfig?.length) {
        domainConfig.forEach((config) => {
            state.domainConfig[config.name] = config.data;
        });
    }
};
