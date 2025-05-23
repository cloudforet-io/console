import type { NotificationProtocolPluginUpgradeModeType } from '@/api-clients/alert-manager/notification-protocol/schema/type';

export interface NotificationProtocolUpdatePluginParameters {
    protocol_id: string;
    version?: string;
    options?: Record<string, any>;
    upgrade_mode?: NotificationProtocolPluginUpgradeModeType;
}
