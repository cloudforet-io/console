import type { Tags } from '@/schema/_common/model';

export interface NameSpaceGroupModel {
    namespace_group_id: string;
    name: string; // 'Common' | 'Etc' | 'AWS' | 'Azure' | 'Google Cloud'
    icon: string;
    description?: string;
    tags: Tags;
    is_managed: boolean;
    domain_id: string;
    created_at: string;
    updated_at: string;
}
