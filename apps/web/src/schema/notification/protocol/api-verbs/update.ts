import type { Tags } from '@/api-clients/_common/schema/model';

export interface ProtocolUpdateParameters {
    protocol_id: string;
    name?: string;
    tags?: Tags;
}
