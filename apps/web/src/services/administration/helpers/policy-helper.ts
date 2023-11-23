import { iso8601Formatter } from '@cloudforet/core-lib';
import type { KeyDataType, ValueHandler, ValueItem } from '@cloudforet/core-lib/component-util/query-search/type';

import type { TimeStamp } from '@/schema/_common/model';
import type { PolicyModel } from '@/schema/identity/user-group/model';

import { POLICY_TYPE } from '@/services/administration/constants/policy-constant';
import type { PolicyType } from '@/services/administration/types/policy-type';




export const policyTypeBadgeColorFormatter = (policyType: PolicyType) => {
    switch (policyType) {
    case POLICY_TYPE.MANAGED: return 'gray500';
    case POLICY_TYPE.CUSTOM: return 'primary1';
    default: return '';
    }
};

export const policyTypeURIFormatter = (policyType: PolicyType) => {
    switch (policyType) {
    case POLICY_TYPE.MANAGED: return 'repository';
    case POLICY_TYPE.CUSTOM: return 'identity';
    default: return '';
    }
};

// eslint-disable-next-line max-len
export const policyCreatedAtFormatter = (createdAt: TimeStamp, selectedPolicyType: PolicyType, timezone: string): string => iso8601Formatter(createdAt?.toString(), timezone, 'YYYY-MM-DD hh:mm:ss') || '--';

export const makeCustomValueHandler = (policyList: PolicyModel[], distinct: string, dataType?: KeyDataType): ValueHandler|undefined => {
    if (['datetime', 'boolean'].includes(dataType || '')) return undefined;

    const allItemSet = new Set<string>();
    policyList.forEach((d) => {
        allItemSet.add(d[distinct]);
    });
    const allItems: ValueItem[] = Array.from(allItemSet).map((d) => ({ name: d, label: d }));

    return async (inputText: string) => {
        let res: ValueItem[] = [...allItems];
        if (inputText) {
            const regex = RegExp(inputText, 'i');
            res = allItems.reduce((result, d) => {
                if (regex.test(d.label) || regex.test(d.name)) result.push(d);
                return result;
            }, [] as ValueItem[]);
        }
        const totalCount = res.length;

        return {
            results: res,
            totalCount,
        };
    };
};
