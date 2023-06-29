import type { TimeStamp } from '@/models';

export interface RepositoryModel {
    repository_id: string;
    name: string;
    endpoint: string;
    version: string;
    secret_id: string;
    created_at: TimeStamp;
}
