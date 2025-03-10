import type { COST_DATA_SOURCE_STATE, COST_DATA_SOURCE_TYPE, COST_DATA_SOURCE_SECRET_TYPE } from './constant';

export type CostDataSourceState = typeof COST_DATA_SOURCE_STATE[keyof typeof COST_DATA_SOURCE_STATE];

export type CostDataSourceType = typeof COST_DATA_SOURCE_TYPE[keyof typeof COST_DATA_SOURCE_TYPE];

export type CostDataSourceSecretType = typeof COST_DATA_SOURCE_SECRET_TYPE[keyof typeof COST_DATA_SOURCE_SECRET_TYPE];

export interface CostDataSourceSchedule {
    state: CostDataSourceState;
    hour: number;
}
