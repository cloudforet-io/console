import type { Tags } from '@/schema/_common/model';
import type { DomainState } from '@/schema/identity/domain/constant';

export interface DomainModel {
    domain_id: string;
    name: string;
    state: DomainState;
    tags: Tags;
    created_at: string;
}
