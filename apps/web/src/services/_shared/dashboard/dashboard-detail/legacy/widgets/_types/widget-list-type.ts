import type {
    BASE_WIDGET_CONFIG_KEYS,
    CONSOLE_WIDGET_CONFIG_KEYS,
} from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_constants/widget-config-list-constant';

export type WidgetConfigKey = typeof CONSOLE_WIDGET_CONFIG_KEYS[number];
export type BaseWidgetConfigKey = typeof BASE_WIDGET_CONFIG_KEYS[number];
