import type { Tags } from '@/schema/_common/model';

export interface NotificationProtocolUpdateParameters {
    protocol_id: string;
    name?: string;
    tags: Tags;
}
