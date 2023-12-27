import type { _GettersTree } from 'pinia';
import { defineStore } from 'pinia';

import { ESCALATION_POLICY_FINISH_CONDITION } from '@/schema/monitoring/escalation-policy/constant';
import type { EscalationPolicyModel } from '@/schema/monitoring/escalation-policy/model';
import type { EscalationPolicyFinishCondition, EscalationPolicyRule } from '@/schema/monitoring/escalation-policy/type';

interface EscalationPolicyFormState {
    escalationPolicyData?: EscalationPolicyModel|undefined;
    name?: string;
    resourceGroup: EscalationPolicyModel['resource_group'];
    rules: EscalationPolicyRule[];
    finishCondition: EscalationPolicyFinishCondition;
    repeatCount: number;
    projectId?: string;
    //
    isNameProjectIdFormValid: boolean;
    isEscalationRulesFormValid: boolean;
}
type EscalationPolicyFormGetters = _GettersTree<{
    isAllValid: boolean;
}> & _GettersTree<EscalationPolicyFormState>;
interface EscalationPolicyFormActions {
    initEscalationPolicyFormData: (escalationPolicyData: EscalationPolicyModel) => void;
}

const DEFAULT_NOTIFICATION_LEVEL = 'LV1';

export const useEscalationPolicyFormStore = defineStore<string, EscalationPolicyFormState, EscalationPolicyFormGetters, EscalationPolicyFormActions>('escalation-policy-form', {
    state: () => ({
        escalationPolicyData: {} as EscalationPolicyModel|undefined,
        name: undefined,
        resourceGroup: 'PROJECT',
        rules: [{ notification_level: DEFAULT_NOTIFICATION_LEVEL, escalate_minutes: undefined }],
        finishCondition: ESCALATION_POLICY_FINISH_CONDITION.acknowledged,
        repeatCount: 0,
        projectId: undefined,
        //
        isNameProjectIdFormValid: false,
        isEscalationRulesFormValid: false,
    }),
    getters: {
        isAllValid: (state) => state.isNameProjectIdFormValid && state.isEscalationRulesFormValid,
    },
    actions: {
        initEscalationPolicyFormData(escalationPolicyData: EscalationPolicyModel) {
            this.escalationPolicyData = escalationPolicyData;
            this.name = escalationPolicyData.name;
            this.resourceGroup = escalationPolicyData.resource_group;
            this.rules = escalationPolicyData.rules;
            this.finishCondition = escalationPolicyData.finish_condition;
            this.repeatCount = escalationPolicyData.repeat_count;
            this.projectId = escalationPolicyData.project_id;
        },
    },
});
