import type { JsonSchema } from '@cloudforet/mirinae/types/controls/forms/json-schema-form/type';

import type { NOTIFICATION_PROTOCOL_STATE, NOTIFICATION_PROTOCOL_PLUGIN_UPGRADE_MODE } from '@/api-clients/alert-manager/notification-protocol/schema/constants';

export type NotificationProtocolStateType = typeof NOTIFICATION_PROTOCOL_STATE[keyof typeof NOTIFICATION_PROTOCOL_STATE];

export type NotificationProtocolPluginUpgradeModeType = typeof NOTIFICATION_PROTOCOL_PLUGIN_UPGRADE_MODE[keyof typeof NOTIFICATION_PROTOCOL_PLUGIN_UPGRADE_MODE];

type NotificationProtocolPluginMetadataDataType = {
    schema: JsonSchema;
};
type NotificationProtocolPluginMetadataType = {
    data_type: 'PLAIN_TEXT' | 'SECRET';
    data: NotificationProtocolPluginMetadataDataType;
};
export type NotificationProtocolPluginInfoType = {
    plugin_id: string;
    version: string;
    options: Record<string, any>;
    metadata: NotificationProtocolPluginMetadataType;
    secret_id?: string;
    upgrade_mode: NotificationProtocolPluginUpgradeModeType;
};

export type NotificationProtocolPluginInfoRequestType = {
    plugin_id: string;
    version: string;
    options: Record<string, any>;
    secret_data?: Record<string, any>;
    schema?: JsonSchema;
    upgrade_mode?: NotificationProtocolPluginUpgradeModeType;
};
