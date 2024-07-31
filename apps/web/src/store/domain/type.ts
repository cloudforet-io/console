export type ExtendedAuthType = 'GOOGLE_OAUTH2' | 'KEYCLOAK_OIDC' | 'SAML';


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
    SETTINGS: 'settings',
} as const;
