import type {
    DomainState, ExtraMenuSet,
} from './type';

export const setDomain = (state: DomainState, domainInfo: DomainState): void => {
    state.domainId = domainInfo.domainId;
    state.name = domainInfo.name;
    state.authOptions = domainInfo.authOptions;
    state.extendedAuthType = domainInfo.extendedAuthType;
};

export const setExtraMenu = (state: DomainState, extraMenu: ExtraMenuSet) => {
    state.extraMenu = extraMenu;
};
