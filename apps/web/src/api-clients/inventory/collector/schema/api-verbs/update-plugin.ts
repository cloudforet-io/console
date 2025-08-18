import type { CollectorOptions } from '@/api-clients/inventory/collector/schema/type';
import type { UpgradeMode } from '@/api-clients/plugin/plugin/type';

export interface CollectorUpdatePluginParameters {
    collector_id: string;
    version?: string;
    options?: CollectorOptions; // backend api will replace whole schedule object
    upgrade_mode?: UpgradeMode;
}
