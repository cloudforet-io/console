import type { Tags, TimeStamp } from '@/schema/_common/model';

export interface ProviderModel {
    provider: string;
    name: string;
    alias: string;
    color: string;
    options: Record<string, any>;
    order: number;
    tags: Tags;
    is_managed: boolean;
    domain_id: string;
    created_at: TimeStamp;
}
