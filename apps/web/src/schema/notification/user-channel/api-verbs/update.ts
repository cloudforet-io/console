import type { Tags } from '@/schema/_common/model';

export type UserChannelUpdateParameters = {
    user_channel_id: string
    name?: string
    data?: object
    tags?: Tags
};
