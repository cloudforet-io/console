import type { Tags } from '@/schema/_common/model';


export interface RegionModel {
    region_id: string;
    name: string;
    region_key: string;
    region_code: string;
    provider: string;
    tags: Tags;
    domain_id: string;
    workspace_id: string;
    created_at: string;
    deleted_at: string;
}
