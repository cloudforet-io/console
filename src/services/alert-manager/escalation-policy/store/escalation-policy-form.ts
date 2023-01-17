import type { ComputedRef } from 'vue';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import type { ScopeType } from '@/services/alert-manager/lib/config';
import { FINISH_CONDITION, SCOPE } from '@/services/alert-manager/lib/config';
import type { Rule, EscalationPolicyDataModel } from '@/services/alert-manager/type';


interface EscalationPolicyFormState {
    name?: string;
    scope: ScopeType
    rules: Rule[];
    finishCondition: FINISH_CONDITION.acknowledged | FINISH_CONDITION.resolved;
    repeatCount: number;
    projectId?: string;
    //
    isAllValid: ComputedRef<boolean>;
    isNameProjectIdFormValid: boolean;
    isEscalationRulesFormValid: boolean;
}

const DEFAULT_NOTIFICATION_LEVEL = 'LV1';

export const useEscalationPolicyFormStore = defineStore('escalation-policy-form', () => {
    const originState = reactive({
        escalationPolicyData: {} as EscalationPolicyDataModel|undefined,
    });
    const state = reactive<EscalationPolicyFormState>({
        name: undefined,
        scope: SCOPE.DOMAIN,
        rules: [{ notification_level: DEFAULT_NOTIFICATION_LEVEL, escalate_minutes: undefined }],
        finishCondition: FINISH_CONDITION.acknowledged,
        repeatCount: 0,
        projectId: undefined,
        //
        isAllValid: computed(() => state.isNameProjectIdFormValid && state.isEscalationRulesFormValid),
        isNameProjectIdFormValid: false,
        isEscalationRulesFormValid: false,
    });

    const resetEscalationPolicyFormData = () => {
        originState.escalationPolicyData = undefined;
        state.name = undefined;
        state.scope = SCOPE.DOMAIN;
        state.rules = [{ notification_level: DEFAULT_NOTIFICATION_LEVEL, escalate_minutes: undefined }];
        state.finishCondition = FINISH_CONDITION.acknowledged;
        state.repeatCount = 0;
        state.projectId = undefined;
    };
    const initEscalationPolicyFormData = (escalationPolicyData: EscalationPolicyDataModel) => {
        originState.escalationPolicyData = escalationPolicyData;
        state.name = escalationPolicyData.name;
        state.scope = escalationPolicyData.scope;
        state.rules = escalationPolicyData.rules;
        state.finishCondition = escalationPolicyData.finish_condition;
        state.repeatCount = escalationPolicyData.repeat_count;
        state.projectId = escalationPolicyData.project_id;
    };

    return {
        originState,
        state,
        resetEscalationPolicyFormData,
        initEscalationPolicyFormData,
    };
});
