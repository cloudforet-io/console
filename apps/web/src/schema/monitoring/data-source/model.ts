import type { DynamicLayout } from '@spaceone/design-system/types/data-display/dynamic/dynamic-layout/type/layout-schema';

import type { Tags } from '@/schema/_common/model';
import type { MonitoringType } from '@/schema/monitoring/data-source/type';


interface DataSourcePluginModel {
    plugin_id: string;
    version?: string;
    options?: Record<string, any>;
    metadata: {
        required_keys: string[];
        supported_providers: string[];
        view: {
            table: {
                layout: DynamicLayout;
            }
        }
    };
    secret_id?: string;
    provider?: string;
    upgrade_mode?: 'AUTO'|'MANUAL';
}

export interface DataSourceModel {
    data_source_id: string;
    name: string;
    state: 'ENABLED' | 'DISABLED';
    monitoring_type: MonitoringType;
    provider: string;
    capability: Record<string, any>;
    plugin_info?: DataSourcePluginModel;
    tags: Tags;
    domain_id: string;
    created_at: string;
}
