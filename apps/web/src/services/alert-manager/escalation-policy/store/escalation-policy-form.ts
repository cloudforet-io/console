import type { _GettersTree } from 'pinia';
import { defineStore } from 'pinia';

import type { ScopeType } from '@/services/alert-manager/lib/config';
import { FINISH_CONDITION, SCOPE } from '@/services/alert-manager/lib/config';
import type { Rule, EscalationPolicyDataModel } from '@/services/alert-manager/type';


interface EscalationPolicyFormState {
    escalationPolicyData?: EscalationPolicyDataModel|undefined;
    name?: string;
    scope: ScopeType
    rules: Rule[];
    finishCondition: FINISH_CONDITION.acknowledged | FINISH_CONDITION.resolved;
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
    initEscalationPolicyFormData: (escalationPolicyData: EscalationPolicyDataModel) => void;
}

const DEFAULT_NOTIFICATION_LEVEL = 'LV1';

export const useEscalationPolicyFormStore = defineStore<string, EscalationPolicyFormState, EscalationPolicyFormGetters, EscalationPolicyFormActions>('escalation-policy-form', {
    state: () => ({
        escalationPolicyData: {} as EscalationPolicyDataModel|undefined,
        name: undefined,
        scope: SCOPE.DOMAIN,
        rules: [{ notification_level: DEFAULT_NOTIFICATION_LEVEL, escalate_minutes: undefined }],
        finishCondition: FINISH_CONDITION.acknowledged,
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
        initEscalationPolicyFormData(escalationPolicyData: EscalationPolicyDataModel) {
            this.escalationPolicyData = escalationPolicyData;
            this.name = escalationPolicyData.name;
            this.scope = escalationPolicyData.scope;
            this.rules = escalationPolicyData.rules;
            this.finishCondition = escalationPolicyData.finish_condition;
            this.repeatCount = escalationPolicyData.repeat_count;
            this.projectId = escalationPolicyData.project_id;
        },
    },
});
