import type { JsonSchema } from '@cloudforet/mirinae/types/controls/forms/json-schema-form/type';

import type { UserChannelModel } from '@/api-clients/alert-manager/user-channel/schema/model';
import type { ProjectChannelModel } from '@/api-clients/notification/project-channel/schema/model';
import type { UserChannelModel as UserChannelModelV1 } from '@/schema/notification/user-channel/model';

interface ExtraChannelData {
    protocol_name: string;
    schema: JsonSchema;
}
type IntersectedChannelProperty = 'name'|'state'|'data'|'is_subscribe'|'subscriptions'|'is_scheduled'|'schedule'|'tags'|'secret_id'|'protocol_id'|'created_at';
export type NotiChannelItemV1 = Partial<ProjectChannelModel>
    & Partial<UserChannelModelV1>
    & Pick<ProjectChannelModel, IntersectedChannelProperty>
    & ExtraChannelData;
export type NotiChannelItem = UserChannelModel;
