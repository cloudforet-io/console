
import type { Tags } from '@/api-clients/_common/schema/model';
import type { ResourceGroupType } from '@/api-clients/_common/schema/type';
import type {
    BudgetNotification,
    BudgetPlannedLimit,
    BudgetState,
    BudgetTimeUnit,
} from '@/api-clients/cost-analysis/budget/schema/type';

import type { Currency } from '@/store/display/type';

export interface BudgetModel {
  budget_id: string;
  name: string;
  limit: number;
  planned_limits: BudgetPlannedLimit[];
  currency: Currency;
  time_unit: BudgetTimeUnit;
  start: string;
  end: string;
  notification: BudgetNotification;
  tags: Tags;
  data_source_id: string;
  resource_group: Extract<ResourceGroupType, 'WORKSPACE' | 'PROJECT'>;
  project_id: string;
  workspace_id: string;
  service_account_id: string;
  budget_manager_id: string;
  domain_id: string;
  created_at: string;
  updated_at: string;
  notified_month: string;
  utilization_rate: number;
  state: BudgetState;
}
