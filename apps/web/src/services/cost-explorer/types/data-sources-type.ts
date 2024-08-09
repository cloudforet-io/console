import type { TranslateResult } from 'vue-i18n';

import type { CostDataSourceModel } from '@/schema/cost-analysis/data-source/model';
import type { CostJobModel } from '@/schema/cost-analysis/job/model';

export interface DataSourceItem extends CostDataSourceModel {
    icon?: string;
    description?: string;
    linked_count?: number;
}

export interface CostJobItem extends CostJobModel {
    duration?: string|null;
}

export type CostJobStatusInfo = {
    icon: string;
    color: string;
    text?: TranslateResult;
};

export type CostLinkedAccountModalType = 'RESET'|'UPDATE';
