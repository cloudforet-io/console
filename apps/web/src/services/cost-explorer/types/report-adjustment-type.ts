import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

export interface AdjustmentPolicyData {
  id: string;
  workspaceMenuItems?: SelectDropdownMenuItem[];
  isAllWorkspaceSelected?: boolean;
}

export interface AdjustmentData {
  id: string;
  policyId: string;
  name: string;
  provider: string;
  adjustment: AdjustmentType;
  amount: number;
  description?: string;
}

export type AdjustmentType = 'PERCENT_DEDUCTION' | 'FIXED_DEDUCTION' | 'PERCENT_ADDITION' | 'FIXED_ADDITION';
