import type { Tags } from '@/api-clients/_common/schema/model';

export type UserChannelUpdateParameters = {
    user_channel_id: string
    name?: string
    data?: object
    tags?: Tags
};
