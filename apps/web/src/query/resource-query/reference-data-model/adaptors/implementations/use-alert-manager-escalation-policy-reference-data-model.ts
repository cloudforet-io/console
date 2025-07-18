import { useEscalationPolicyApi } from '@/api-clients/alert-manager/escalation-policy/composables/use-escalation-policy-api';
import type { EscalationPolicyModel } from '@/api-clients/alert-manager/escalation-policy/schema/model';
import { useReferenceDataModel } from '@/query/resource-query/reference-data-model/composables/use-reference-data-model';
import type { ReferenceDataModelImplementationAdaptor } from '@/query/resource-query/reference-data-model/types/reference-data-model.adaptor';
import type {
    ReferenceDataModelFetchConfig,
    ReferenceItem, ReferenceMap,
} from '@/query/resource-query/reference-data-model/types/reference-type';
import { RESOURCE_CONFIG_MAP } from '@/query/resource-query/shared/contants/resource-config-map';


export type AlertManagerEscalationPolicyReferenceItem = ReferenceItem<EscalationPolicyModel>;
export type AlertManagerEscalationPolicyReferenceMap = ReferenceMap<AlertManagerEscalationPolicyReferenceItem>;

export const useAlertManagerEscalationPolicyReferenceDataModel: ReferenceDataModelImplementationAdaptor<AlertManagerEscalationPolicyReferenceItem> = () => {
    const { escalationPolicyAPI } = useEscalationPolicyApi();
    const fetchConfig: ReferenceDataModelFetchConfig<EscalationPolicyModel> = {
        listFetcher: escalationPolicyAPI.list,
        query: {
            only: ['escalation_policy_id', 'name', 'service_id'],
        },
    };
    const {
        referenceMap,
    } = useReferenceDataModel<EscalationPolicyModel, AlertManagerEscalationPolicyReferenceItem>(
        RESOURCE_CONFIG_MAP.alertManagerEscalationPolicy.resourceKey,
        (escalationPolicyInfo: EscalationPolicyModel) => ({
            key: escalationPolicyInfo.escalation_policy_id,
            label: escalationPolicyInfo.name,
            name: escalationPolicyInfo.name,
            data: escalationPolicyInfo,
        }),
        fetchConfig,
    );

    return {
        map: referenceMap,
    };
};
