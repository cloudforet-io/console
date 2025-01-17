import type { Tags } from '@/schema/_common/model';
import type { NotificationProtocolPluginInfoRequestType } from '@/schema/alert-manager/notification-protocol/type';


export interface NotificationProtocolCreateParameters {
    name: string;
    plugin_info: NotificationProtocolPluginInfoRequestType;
    tags: Tags;
}
