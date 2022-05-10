import { POLICY_TYPES } from '@/services/administration/iam/policy/lib/config';

export const policyTypeColorFormatter = (policyType: POLICY_TYPES) => {
    switch (policyType) {
    case POLICY_TYPES.MANAGED: return 'gray';
    case POLICY_TYPES.CUSTOM: return 'primary1';
    default: return '';
    }
};

export const policyTypeURIFormatter = (policyType: POLICY_TYPES) => {
    switch (policyType) {
    case POLICY_TYPES.MANAGED: return 'repository';
    case POLICY_TYPES.CUSTOM: return 'identity';
    default: return '';
    }
};
