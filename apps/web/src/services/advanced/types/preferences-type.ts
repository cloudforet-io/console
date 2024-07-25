
export type DormancyConfig = {
    enabled: boolean;
    cost: number;
    send_email: boolean;
};

export interface PreferencesData {
    display_name?: string;
    admin_email?: string;
    timezone?: string;
    language?: string;
    wordtype_logo_url?: string;
    symbol_favicon_url?: string;
    login_page_image_url?: string;
}
