import type { Tags } from '@/api-clients/_common/schema/model';

export interface NotificationProtocolUpdateParameters {
    protocol_id: string;
    name?: string;
    tags: Tags;
}
