import type { Tags } from '@/schema/_common/model';
import type { ResourceGroupType } from '@/schema/_common/type';
import type {
    CollectorMetadata, CollectorOptions, Schedule, SecretFilter,
} from '@/schema/inventory/collector/type';
import type { UpgradeMode } from '@/schema/plugin/plugin/type';
import type { Capability } from '@/schema/repository/plugin/type';


export interface CollectorPluginInfo {
    plugin_id: string;
    version: string;
    options: CollectorOptions;
    metadata: CollectorMetadata;
    upgrade_mode: UpgradeMode;
}


export interface CollectorModel {
    collector_id: string;
    name: string;
    provider: string;
    capability: Capability;
    secret_filter: SecretFilter;
    plugin_info: CollectorPluginInfo;
    schedule?: Schedule;
    tags: Tags;
    resource_group: Extract<ResourceGroupType, 'DOMAIN'|'WORKSPACE'>;
    domain_id: string;
    workspace_id: string;
    created_at: string;
    last_collected_at: string;
}

