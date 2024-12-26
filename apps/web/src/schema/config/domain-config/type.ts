import type { DOMAIN_CONFIG_NAMES } from '@/schema/config/domain-config/constant';

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

export type DomainConfigKey = keyof typeof DOMAIN_CONFIG_NAMES;
