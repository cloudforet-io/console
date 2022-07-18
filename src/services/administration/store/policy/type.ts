import type { PolicyDataModel } from '@/services/administration/iam/policy/lib/type';

export interface PolicyState {
	policyData: Partial<PolicyDataModel>|null;
	policyListLoading: boolean;
	policyList?: PolicyDataModel[];
	totalCount?: number;
}

export interface UpdatePolicyParams {
	policyId: string;
	updateParams: any;
}
