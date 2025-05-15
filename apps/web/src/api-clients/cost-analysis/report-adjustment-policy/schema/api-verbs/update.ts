import type { Tags } from '@/api-clients/_common/schema/model';

export interface ReportAdjustmentPolicyUpdateParameters {
    report_adjustment_policy_id: string;
    tags?: Tags;
}
