import type { Tags } from '@/schema/_common/model';

export interface ProtocolUpdateParameters {
    protocol_id: string;
    name?: string;
    tags?: Tags;
}
