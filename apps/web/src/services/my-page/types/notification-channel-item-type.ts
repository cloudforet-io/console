import type { JsonSchema } from '@spaceone/design-system/types/inputs/forms/json-schema-form/type';

import type { ProjectChannelModel } from '@/schema/notification/project-channel/model';
import type { UserChannelModel } from '@/schema/notification/user-channel/model';

interface ExtraChannelData {
    protocol_name: string;
    schema: JsonSchema;
}
type IntersectedChannelProperty = 'name'|'state'|'data'|'is_subscribe'|'subscriptions'|'is_scheduled'|'schedule'|'tags'|'secret_id'|'protocol_id'|'created_at';
export type NotiChannelItem = Partial<ProjectChannelModel>
    & Partial<UserChannelModel>
    & Pick<ProjectChannelModel, IntersectedChannelProperty>
    & ExtraChannelData;
