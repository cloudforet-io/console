export type ExtendedAuthType = 'GOOGLE_OAUTH2' | 'KEYCLOAK' | 'KB_SSO';

export interface DomainState {
    domainId?: string;
    name?: string;
    extendedAuthType?: ExtendedAuthType;
    authOptions?: Record<string, any>;
    extraMenu?: ExtraMenuSet;
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

export const DOMAIN_CONFIG_TYPE = {
    EXTRA_MENU: 'console:ext-menu',
} as const;
