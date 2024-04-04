import type { CollectorOptions } from '@/schema/inventory/collector/type';
import type { UpgradeMode } from '@/schema/plugin/plugin/type';

export interface CollectorUpdatePluginParameters {
    collector_id: string;
    version?: string;
    options?: CollectorOptions; // backend api will replace whole schedule object
    upgrade_mode?: UpgradeMode;
}
