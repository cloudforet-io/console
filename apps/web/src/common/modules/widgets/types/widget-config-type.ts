import type { Granularity } from '@/schema/dashboard/_types/widget-type';

import type { WIDGET_SIZE } from '@/common/modules/widgets/_constants/widget-constant';


export type WidgetSize = typeof WIDGET_SIZE[keyof typeof WIDGET_SIZE];

export interface NewWidgetConfig {
    widget_name: string;
    meta: {
        title?: string;
        description?: string;
        sizes: WidgetSize[];
        chart_type: string;
        granularity?: Granularity;
    };
    data_mapping_schema: {
        [key: string]: {
            label?: string;
            select_options?: { // group_by only
                multiple?: boolean;
                max?: number;
            };
            fixed_options?: { // group_by only
                enabled: boolean;
                value: string;
            }
        }
    };
    chart_options_schema: {
        [key: string]: {
            type: string;
            label?: string;
            fields?: string[]; // only for format_rules
        }
    }
}
