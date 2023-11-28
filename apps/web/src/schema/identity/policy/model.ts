import type { Tags, TimeStamp } from '@/schema/_common/model';

export interface PolicyModel {
    created_at: TimeStamp;
    domain_id: string;
    name: string;
    permissions: Array<string>;
    policy_id: string;
    repository_info?: RepositoryInfoDataModel;
    tags: Tags;
    policy_type?: string;
    project_id?: string;
    labels?: any;
    state?: PolicyState;
    updated_at?: TimeStamp;
}

interface RepositoryInfoDataModel {
    repository_id: string;
    name: string;
    repository_type: string;
    endpoint: string;
}

type PolicyState = 'ENABLED' | 'DISABLED';
