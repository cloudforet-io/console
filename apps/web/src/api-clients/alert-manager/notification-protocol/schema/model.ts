import type { TranslateResult } from 'vue-i18n';

import type { Tags } from '@/api-clients/_common/schema/model';

import type {
    NotificationProtocolPluginInfoType,
    NotificationProtocolStateType,
} from '@/schema/alert-manager/notification-protocol/type';

export interface NotificationProtocolModel {
    protocol_id: string;
    name: string|TranslateResult;
    state: NotificationProtocolStateType;
    plugin_info: NotificationProtocolPluginInfoType;
    tags: Tags;
    domain_id: string;
    created_at: string;
}
