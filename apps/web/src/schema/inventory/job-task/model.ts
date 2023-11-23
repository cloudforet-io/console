import type { Tags, TimeStamp } from '@/schema/_common/model';
import type { USER_TYPE } from '@/schema/identity/user/constant';
import type { RoleBindingModel } from '@/schema/inventory/cloud-service-query-set/model';

import type { JobTaskError } from '@/services/asset-inventory/types/collector-history-job-type';

export interface UserModel {
    created_at: TimeStamp;
    domain_id?: string;
    email?: string;
    email_verified?: boolean;
    language: string;
    last_accessed_at: TimeStamp | number;
    name: string;
    state: string;
    tags?: Tags;
    timezone: string;
    user_id: string;
    backend: string;
    user_type: UserType;
    role_bindings?: RoleBindingModel[];
}

export type UserType = typeof USER_TYPE[keyof typeof USER_TYPE];

export interface JobTaskModel {
    job_task_id: string;
    status: string;
    create_count: number;
    updated_count: number;
    failure_count: number;
    deleted_count: number;
    disconnected_count: number;
    errors: JobTaskError[];
    job_id: string;
    secret_id: string;
    provider: string;
    service_account_id: string;
    project_id: string;
    domain_id: string;
    created_at: string;
    started_at: string;
    finished_at: string;
}
