import type { JsonSchema } from '@cloudforet/mirinae/types/controls/forms/json-schema-form/type';

export type ProtocolState = 'ENABLED'|'DISABLED';

export interface ProtocolCapability {
    supported_schema: string[];
}

type ProtocolPluginMetadata = {
    data_type: 'PLAIN_TEXT'|'SECRET';
    data: {
        schema: JsonSchema;
    }
} | Record<string, never>;

type ProtocolPluginUpgradeMode = 'AUTO'|'MANUAL';

export interface ProtocolPluginInfo {
    plugin_id: string;
    version: string;
    options: Record<string, any>;
    metadata: ProtocolPluginMetadata;
    secret_id?: string;
    upgrade_mode: ProtocolPluginUpgradeMode;
}
