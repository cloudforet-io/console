import { useEscalationPolicyApi } from '@/api-clients/monitoring/escalation-policy/composables/use-escalation-policy-api';
import type { EscalationPolicyModel } from '@/api-clients/monitoring/escalation-policy/schema/model';
import { useReferenceDataModel } from '@/query/resource-query/reference-data-model/composables/use-reference-data-model';
import type { ReferenceDataModelImplementationAdaptor } from '@/query/resource-query/reference-data-model/types/reference-data-model.adaptor';
import type {
    ReferenceDataModelFetchConfig,
    ReferenceItem, ReferenceMap,
} from '@/query/resource-query/reference-data-model/types/reference-type';
import { RESOURCE_CONFIG_MAP } from '@/query/resource-query/shared/contants/resource-config-map';


export type MonitoringEscalationPolicyReferenceItem = ReferenceItem<EscalationPolicyModel>;
export type MonitoringEscalationPolicyReferenceMap = ReferenceMap<MonitoringEscalationPolicyReferenceItem>;

export const useMonitoringEscalationPolicyReferenceDataModel: ReferenceDataModelImplementationAdaptor<MonitoringEscalationPolicyReferenceItem> = () => {
    const { escalationPolicyAPI } = useEscalationPolicyApi();
    const fetchConfig: ReferenceDataModelFetchConfig<EscalationPolicyModel> = {
        listFetcher: escalationPolicyAPI.list,
        query: {
            only: ['escalation_policy_id', 'name', 'resource_group', 'project_id'],
        },
    };
    const {
        referenceMap,
    } = useReferenceDataModel<EscalationPolicyModel, MonitoringEscalationPolicyReferenceItem>(
        RESOURCE_CONFIG_MAP.monitoringEscalationPolicy.resourceKey,
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
