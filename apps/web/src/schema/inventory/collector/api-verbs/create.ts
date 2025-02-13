import type { Tags } from '@/api-clients/_common/schema/model';
import type { ResourceGroupType } from '@/api-clients/_common/schema/type';
import type { CollectorPluginInfo } from '@/schema/inventory/collector/model';
import type { Schedule, SecretFilter } from '@/schema/inventory/collector/type';

export interface CollectorCreateParameters {
    name: string;
    plugin_info: Partial<CollectorPluginInfo>;
    schedule?: Schedule; // backend api will replace whole schedule object
    secret_filter?: SecretFilter; // backend api will replace whole schedule object
    provider?: string;
    tags?: Tags;
    resource_group: Extract<ResourceGroupType, 'DOMAIN'|'WORKSPACE'>;
    workspace_id?: string;
}
