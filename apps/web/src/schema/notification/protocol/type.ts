import type { JsonSchema } from '@spaceone/design-system/types/inputs/forms/json-schema-form/type';

export type ProtocolState = 'ENABLED'|'DISABLED';

export interface ProtocolCapability {
    supported_schema: string[];
}

export interface ProtocolPluginInfo {
    plugin_id: string;
    version: string;
    options: Record<string, any>;
    metadata: {
        data_type: 'PLAIN_TEXT'|'SECRET';
        data: {
            schema: JsonSchema;
        }
    } | Record<string, never>;
    upgrade_mode: 'AUTO'|'MANUAL';
}
