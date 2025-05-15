

export interface AdjustmentPolicyData {
  id: string;
  workspaceIdList: string[];
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
