import type { Tags } from '@/api-clients/_common/schema/model';
import type { NotificationProtocolPluginInfoRequestType } from '@/api-clients/alert-manager/notification-protocol/schema/type';

export interface NotificationProtocolCreateParameters {
    name: string;
    plugin_info: NotificationProtocolPluginInfoRequestType;
    tags: Tags;
}
