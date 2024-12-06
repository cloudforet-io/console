import type { Currency } from '@/store/display/type';

export type DormancyConfig = {
    enabled: boolean;
    cost: number;
    send_email: boolean;
};

export type UnifiedCostConfig = {
    aggregation_day?: number;
    currency?: Currency;
    is_last_day?: boolean;
    exchange_source?: string;
};

export interface PreferencesData {
    display_name?: string;
    admin_email?: string;
    timezone?: string;
    language?: string;
    wordtype_logo_url?: string;
    symbol_favicon_url?: string;
    login_page_image_url?: string;
    unified_cost_config?: UnifiedCostConfig;
}
