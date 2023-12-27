import type {
    BASE_WIDGET_CONFIG_KEYS,
    CONSOLE_WIDGET_CONFIG_KEYS,
} from '@/services/dashboards/widgets/_constants/widget-config-list-constant';

export type WidgetConfigKey = typeof CONSOLE_WIDGET_CONFIG_KEYS[number];
export type BaseWidgetConfigKey = typeof BASE_WIDGET_CONFIG_KEYS[number];
