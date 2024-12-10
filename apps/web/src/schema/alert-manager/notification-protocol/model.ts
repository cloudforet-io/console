import type { Tags } from '@/schema/_common/model';
import type {
    NotificationProtocolPluginInfoType,
    NotificationProtocolStateType,
} from '@/schema/alert-manager/notification-protocol/type';

export interface NotificationProtocolModel {
    protocol_id: string;
    name: string;
    state: NotificationProtocolStateType;
    plugin_info: NotificationProtocolPluginInfoType;
    tags: Tags;
    domain_id: string;
    created_at: string;
}
