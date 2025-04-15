import type { SUMMARY_DATA_TYPE } from '@/services/workspace-home/shared/constants/summary-type-constant';

export type SummaryDataType = typeof SUMMARY_DATA_TYPE[keyof typeof SUMMARY_DATA_TYPE];
