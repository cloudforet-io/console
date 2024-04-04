import type { DiffType, ChangeHistoryAction, UpdatedBy } from '@/schema/inventory/change-history/type';

export interface ChangeHistoryModel {
    record_id: string;
    action: ChangeHistoryAction;
    diff: {
        key:string,
        before:any,
        after:any,
        type: DiffType
    }[];
    diff_count: number;
    cloud_service_id: string;
    updated_by: UpdatedBy;
    user_id: string;
    collector_id: string;
    job_id: string;
    domain_id: string;
    created_at: string;
}
