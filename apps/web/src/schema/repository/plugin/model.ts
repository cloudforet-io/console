import type { Tags } from '@/schema/_common/model';
import type { Capability, PluginState, RegistryType } from '@/schema/repository/plugin/type';
import type { RepositoryInfo } from '@/schema/repository/repository/model';

export interface PluginModel {
    plugin_id: string;
    name: string;
    state: PluginState;
    image: string;
    provider?: string;
    registry_type: RegistryType;
    registry_url: string;
    registry_config: object;
    capability: Capability;
    repository_info: RepositoryInfo;
    labels: string[];
    tags: {
        icon?: string;
        description?: string;
        link?: string;
        beta?: string;
    } & Tags;
    domain_id: string;
    created_at: string;
    updated_at: string;
}
