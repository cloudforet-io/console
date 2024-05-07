import type { CostJobModel } from '@/schema/cost-analysis/job/model';
import type { DataSourceModel } from '@/schema/monitoring/data-source/model';

export interface DataSourceItem extends DataSourceModel {
    icon?: string;
}

export interface CostJobItem extends CostJobModel {
    duration?: string|null;
}
