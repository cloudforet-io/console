import { PolicyDataModel } from '@/services/administration/iam/policy/lib/type';

export interface PolicyState {
	policyData: Partial<PolicyDataModel>|null;
}

export interface UpdatePolicyParams {
	policyId: string;
	updateParams: any;
}
