export type ExtendedAuthType = 'GOOGLE_OAUTH2' | 'KEYCLOAK' | 'KB_SSO';

export interface DomainState {
    domainId?: string;
    name?: string;
    extendedAuthType?: ExtendedAuthType;
    authOptions?: Record<string, any>;
    billingEnabled: boolean;
    extraMenuSet?: ExtraMenuSet;
}

export interface DomainConfigModel {
    name: string;
    data: ExtraMenuSet;
}

export interface ExtraMenuSet {
    contents: ExtraMenu[];
    title: string;
}

export interface ExtraMenu {
    title: string;
    sub_menu: ExtraSubMenu[];
}

export interface ExtraSubMenu {
    link: string;
    label: string;
}
