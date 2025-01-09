import type { NotificationProtocolPluginUpgradeModeType } from '@/schema/alert-manager/notification-protocol/type';

export interface NotificationProtocolUpdatePluginParameters {
    protocol_id: string;
    version?: string;
    options?: Record<string, any>;
    upgrade_mode?: NotificationProtocolPluginUpgradeModeType;
}
