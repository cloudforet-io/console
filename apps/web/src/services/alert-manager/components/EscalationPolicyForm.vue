<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PFieldGroup, PRadio, PTextInput, PLink,
} from '@spaceone/design-system';
import { ACTION_ICON } from '@spaceone/design-system/src/inputs/link/type';

import { ESCALATION_POLICY_FINISH_CONDITION } from '@/schema/monitoring/escalation-policy/constant';
import type { EscalationPolicyModel } from '@/schema/monitoring/escalation-policy/model';
import type { EscalationPolicyFinishCondition, EscalationPolicyResourceGroup } from '@/schema/monitoring/escalation-policy/type';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import { useFormValidator } from '@/common/composables/form-validator';
import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

import EscalationPolicyFormRulesInput from '@/services/alert-manager/components/EscalationPolicyFormRulesInput.vue';
import { ACTION } from '@/services/alert-manager/constants/alert-constant';
import { useEscalationPolicyFormStore } from '@/services/alert-manager/stores/escalation-policy-form-store';
import type { ActionMode } from '@/services/alert-manager/types/alert-type';
import { PROJECT_ROUTE } from '@/services/project/routes/route-constant';
import type { ProjectTreeNodeData } from '@/services/project/types/project-tree-type';


const props = withDefaults(defineProps<{
    mode: ActionMode;
    showScope?: boolean;
    escalationPolicyData?: EscalationPolicyModel;
}>(), {
    mode: ACTION.create,
    showScope: true,
    escalationPolicyData: undefined,
});

const allReferenceStore = useAllReferenceStore();
const escalationPolicyFormStore = useEscalationPolicyFormStore();
const escalationPolicyFormState = escalationPolicyFormStore.$state;
const state = reactive({
    projects: computed(() => allReferenceStore.getters.project),
    //
    scopeLabels: computed<Record<EscalationPolicyResourceGroup, TranslateResult>>(() => ({
        WORKSPACE: i18n.t('MONITORING.ALERT.ESCALATION_POLICY.FORM.WORKSPACE'),
        PROJECT: i18n.t('MONITORING.ALERT.ESCALATION_POLICY.FORM.PROJECT'),
    })),
    scopes: computed<{label: TranslateResult; value: EscalationPolicyResourceGroup}[]>(() => [
        { label: i18n.t('MONITORING.ALERT.ESCALATION_POLICY.FORM.WORKSPACE'), value: 'WORKSPACE' },
        { label: i18n.t('MONITORING.ALERT.ESCALATION_POLICY.FORM.PROJECT'), value: 'PROJECT' },
    ]),
    finishConditions: computed<{label: TranslateResult; value: EscalationPolicyFinishCondition}[]>(() => [
        { label: i18n.t('MONITORING.ALERT.ESCALATION_POLICY.FORM.ACKNOWLEDGED'), value: ESCALATION_POLICY_FINISH_CONDITION.acknowledged },
        { label: i18n.t('MONITORING.ALERT.ESCALATION_POLICY.FORM.RESOLVED'), value: ESCALATION_POLICY_FINISH_CONDITION.resolved },
    ]),
});

const {
    forms: { name },
    setForm,
    invalidState,
    invalidTexts,
    isAllValid,
} = useFormValidator({
    name: undefined as string|undefined,
    projectId: undefined as string|undefined,
}, {
    name(value) {
        if (!value) return i18n.t('MONITORING.ALERT.ESCALATION_POLICY.FORM.NAME_REQUIRED');
        if (value.length > 40) return i18n.t('MONITORING.ALERT.ESCALATION_POLICY.FORM.NAME_INVALID_TEXT');
        return true;
    },
    projectId(value) {
        if (!value) return i18n.t('MONITORING.ALERT.ESCALATION_POLICY.FORM.PROJECT_REQUIRED');
        return true;
    },
});

/* event */
const handleChangeScope = (value: EscalationPolicyModel['resource_group']) => {
    escalationPolicyFormStore.$patch({ resourceGroup: value });
    if (value === 'WORKSPACE') {
        escalationPolicyFormStore.$patch({ projectId: undefined });
    }
};
const handleChangeFinishCondition = (value) => {
    escalationPolicyFormStore.$patch({ finishCondition: value });
};
const handleUpdateName = (_name) => {
    setForm('name', _name);
    escalationPolicyFormStore.$patch({ name: _name });
};
const handleSelectProject = (selected: ProjectTreeNodeData[]) => {
    setForm('projectId', selected[0]?.id);
    escalationPolicyFormStore.$patch({ projectId: selected[0]?.id });
};

watch([() => props.mode, () => props.escalationPolicyData], ([mode, escalationPolicyData]) => {
    if (mode === ACTION.create) {
        escalationPolicyFormStore.$reset();
    } else if (props.escalationPolicyData?.escalation_policy_id) {
        escalationPolicyFormStore.initEscalationPolicyFormData(escalationPolicyData);
        setForm('name', escalationPolicyFormState.name);
        setForm('projectId', escalationPolicyFormState.projectId);
    }
}, { immediate: true });
watch(() => isAllValid.value, (_isAllValid) => {
    escalationPolicyFormStore.$patch({ isNameProjectIdFormValid: _isAllValid });
}, { immediate: true });
</script>

<template>
    <div class="escalation-policy-form">
        <p-field-group required
                       :label="$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.NAME_LABEL')"
                       :invalid="invalidState.name"
                       :invalid-text="invalidTexts.name"
        >
            <template #default="{invalid}">
                <p-text-input :value="name"
                              :invalid="invalid"
                              class="w-1/2"
                              @update:value="handleUpdateName"
                />
            </template>
        </p-field-group>
        <p-field-group v-if="props.showScope"
                       :label="$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.SCOPE_LABEL')"
                       required
        >
            <template #default>
                <div v-if="props.mode === ACTION.create">
                    <p-radio v-for="(item, idx) in state.scopes"
                             :key="idx"
                             :selected="item.value"
                             :value="escalationPolicyFormState.resourceGroup"
                             @change="handleChangeScope(item.value)"
                    >
                        {{ item.label }}
                    </p-radio>
                </div>
            </template>
            <template #label-extra>
                <span v-if="props.mode === ACTION.update"
                      class="scope-text"
                >
                    <span>{{ state.scopeLabels[escalationPolicyFormState.resourceGroup] }}</span>
                    <span v-if="escalationPolicyFormState.resourceGroup === 'PROJECT'">
                        (<p-link :action-icon="ACTION_ICON.INTERNAL_LINK"
                                 new-tab
                                 :to="referenceRouter(escalationPolicyFormState.projectId,{ resource_type: 'identity.Project' })"
                                 :text="state.projects[escalationPolicyFormState.projectId] ? state.projects[escalationPolicyFormState.projectId].label : escalationPolicyFormState.projectId"
                                 highlight
                        />)
                    </span>
                </span>
            </template>
        </p-field-group>
        <p-field-group v-if="props.showScope && escalationPolicyFormState.resourceGroup === 'PROJECT' && props.mode === ACTION.create"
                       class="project-field"
                       required
                       :invalid="invalidState.projectId"
                       :invalid-text="invalidTexts.projectId"
        >
            <template #label>
                <span>{{ $t('MONITORING.ALERT.ESCALATION_POLICY.FORM.PROJECT_LABEL') }}</span>
                <p-link class="link-text"
                        :action-icon="ACTION_ICON.INTERNAL_LINK"
                        new-tab
                        size="sm"
                        :to="{ name: PROJECT_ROUTE._NAME }"
                        :text="$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.GO_CREATE_PROJECT')"
                        highlight
                />
            </template>
            <template #default="{invalid}">
                <project-select-dropdown project-selectable
                                         :invalid="invalid"
                                         @select="handleSelectProject"
                />
            </template>
        </p-field-group>
        <p-field-group
            :label="$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.FINISH_CONDITION_LABEL')"
            required
        >
            <p-radio v-for="(item, idx) in state.finishConditions"
                     :key="idx"
                     :selected="item.value"
                     :value="escalationPolicyFormState.finishCondition"
                     @change="handleChangeFinishCondition(item.value)"
            >
                {{ item.label }}
            </p-radio>
        </p-field-group>
        <p-field-group
            :label="$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.ESCALATION_RULES_LABEL')"
            required
        >
            <template #help>
                <span class="help-text">
                    {{ $t('MONITORING.ALERT.ESCALATION_POLICY.FORM.ESCALATION_RULES_HELP_TEXT') }}
                </span>
            </template>
            <escalation-policy-form-rules-input />
        </p-field-group>
    </div>
</template>

<style lang="postcss" scoped>
.escalation-policy-form {
    /* custom design-system component - p-field-group */
    :deep(.project-field) {
        .label-box {
            display: block;
            .form-label {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
        }
        .link-text {
            font-weight: normal;
        }
        .title-wrapper {
            .title {
                width: 100%;
                justify-content: space-between;
                display: flex;
            }
        }
    }
    .p-text-input {
        .input-container {
            @apply rounded-md;
        }
    }
    .p-radio {
        &:first-of-type {
            margin-right: 1.125rem;
        }
    }
    .scope-text {
        text-transform: capitalize;
        font-weight: normal;
        padding-left: 0.5rem;
    }
    .help-text {
        @apply text-gray-900;
        font-size: 0.875rem;
    }
}
</style>
