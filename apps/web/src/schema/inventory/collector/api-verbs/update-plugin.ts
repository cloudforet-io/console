import type { CollectorOptions, UpgradeMode } from '@/schema/inventory/collector/type';

export interface CollectorUpdatePluginParameters {
    collector_id: string;
    version?: string;
    options?: CollectorOptions; // backend api will replace whole schedule object
    upgrade_mode?: UpgradeMode;
}
