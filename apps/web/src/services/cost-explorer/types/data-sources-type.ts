import type { TranslateResult } from 'vue-i18n';

import type { CostDataSourceModel } from '@/api-clients/cost-analysis/data-source/schema/model';
import type { CostJobModel } from '@/api-clients/cost-analysis/job/schema/model';


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

export type DataCollectionHistoryModalType = 'ERROR'|'RE-SYNC'|'CANCEL'|'RESTART';
