import type { UpgradeMode } from '@/schema/plugin/plugin/type';

export interface GetPluginMetadataParameters {
    plugin_id: string;
    version?: string;
    upgrade_mode?: UpgradeMode;
    options?: object;
}

export interface GetPluginMetadataResponse {
    metadata: any;
}
