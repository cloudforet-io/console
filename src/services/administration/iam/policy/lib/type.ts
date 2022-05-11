import { POLICY_TYPES, PolicyState } from '@/services/administration/iam/policy/lib/config';
import { Tags, TimeStamp } from '@/models';

export interface PolicyStoreState {
    name: string;
}

export interface PolicyDataModel {
    created_at: TimeStamp;
    domain_id: string;
    name: string;
    permissions: Array<string>;
    policy_id: string;
    repository_info?: RepositoryInfoDataModel;
    tags: Tags;
    project_id?: string;
    labels?: any;
    state?: PolicyState;
    updated_at?: TimeStamp;
}

interface RepositoryInfoDataModel {
    repository_id: string;
    name: string;
    repository_type: string,
    endpoint: string;
}

export interface PolicyDetailPageProps {
    id: string;
    type: POLICY_TYPES
}
