import type { Tags } from '@/api-clients/_common/schema/model';
import type { DomainState } from '@/api-clients/identity/domain/schema/constant';

export interface DomainModel {
    domain_id: string;
    name: string;
    state: DomainState;
    tags: Tags;
    created_at: string;
}
