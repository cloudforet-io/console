import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

export interface AdjustmentPolicyData {
  id: string;
  workspaceMenuItems?: SelectDropdownMenuItem[];
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

export type AdjustmentType = 'PERCENTAGE_DEDUCTION' | 'FIXED_DEDUCTION' | 'PERCENTAGE_ADDITION' | 'FIXED_ADDITION';
