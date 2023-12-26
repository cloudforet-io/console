import type { DynamicLayout } from '@spaceone/design-system/types/data-display/dynamic/dynamic-layout/type/layout-schema';

import type { MonitoringType } from '@/schema/monitoring/data-source/type';

export interface DataSourceModel {
    data_source_id: string;
    name: string;
    state: 'ENABLED' | 'DISABLED';
    monitoring_type: MonitoringType;
    provider: string;
    capability: object;
    tags: { [key: string]: string };
    plugin_info?: {
        plugin_id: string;
        version?: string;
        options?: object;
        provider: string;
        upgrade_mode?: 'AUTO'|'MANUAL';
        metadata: {
            required_keys: string[];
            supported_providers: string[];
            view: {
                table: {
                    layout: DynamicLayout;
                }
            }
        }
    }
}
