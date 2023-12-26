import type { PERIOD_DROPDOWN_MENU } from '@/services/cost-explorer/constants/cost-analysis-period-constant';
import type { RelativePeriod } from '@/services/cost-explorer/types/cost-explorer-query-type';


export type PeriodDropdownMenu = typeof PERIOD_DROPDOWN_MENU[keyof typeof PERIOD_DROPDOWN_MENU];

export interface PeriodDropdownMenuItem {
    name: PeriodDropdownMenu;
    relativePeriod: RelativePeriod;
    label?: string;
}
