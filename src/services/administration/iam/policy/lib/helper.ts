import { POLICY_TYPES } from '@/services/administration/iam/policy/lib/config';
import { HandlerResponse, KeyDataType } from '@spaceone/console-core-lib/component-util/query-search/type';
import { PolicyDataModel } from '@/services/administration/iam/policy/lib/type';

export const policyTypeBadgeColorFormatter = (policyType: POLICY_TYPES) => {
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

export const makeCustomValueHandler = (policyList: PolicyDataModel[], distinct: string, dataType?: KeyDataType): HandlerResponse|undefined => {
    if (['datetime', 'boolean'].includes(dataType || '')) return undefined;
    // todo
    return undefined;
};
