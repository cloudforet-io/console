import type { TranslateResult } from 'vue-i18n';

import type { CostJobModel } from '@/schema/cost-analysis/job/model';
import type { DataSourceModel } from '@/schema/monitoring/data-source/model';

export interface DataSourceItem extends DataSourceModel {
    icon?: string;
    description?: string;
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
