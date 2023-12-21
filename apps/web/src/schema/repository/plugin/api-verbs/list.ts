import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { RegistryType } from '@/schema/repository/plugin/type';

export interface PluginListParameters {
    query?: Query;
    plugin_id?: string;
    name?: string;
    state?: string;
    resource_type?: string;
    provider?: string;
    registry_type?: RegistryType;
    repository_id?: string;
}
