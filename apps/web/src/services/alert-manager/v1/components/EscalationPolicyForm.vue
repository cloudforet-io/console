<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PFieldGroup, PRadio, PTextInput, PLink,
} from '@cloudforet/mirinae';


import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import { ESCALATION_POLICY_FINISH_CONDITION } from '@/schema/monitoring/escalation-policy/constant';
import type { EscalationPolicyModel } from '@/schema/monitoring/escalation-policy/model';
import type { EscalationPolicyFinishCondition } from '@/schema/monitoring/escalation-policy/type';
import { i18n } from '@/translations';

import { useReferenceRouter } from '@/router/composables/use-reference-router';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import { useFormValidator } from '@/common/composables/form-validator';
import type { ProjectTreeNodeData } from '@/common/modules/project/project-tree-type';
import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

import EscalationPolicyFormRulesInput from '@/services/alert-manager/v1/components/EscalationPolicyFormRulesInput.vue';
import { ACTION } from '@/services/alert-manager/v1/constants/alert-constant';
import { useEscalationPolicyFormStore } from '@/services/alert-manager/v1/stores/escalation-policy-form-store';
import type { ActionMode } from '@/services/alert-manager/v1/types/alert-type';
import { PROJECT_ROUTE_V1 } from '@/services/project/v1/routes/route-constant';

const props = withDefaults(defineProps<{
    mode: ActionMode;
    showResourceGroup?: boolean;
    escalationPolicyData?: EscalationPolicyModel;
}>(), {
    mode: ACTION.create,
    showResourceGroup: true,
    escalationPolicyData: undefined,
});

const allReferenceStore = useAllReferenceStore();
const userWorkspaceStore = useUserWorkspaceStore();
const escalationPolicyFormStore = useEscalationPolicyFormStore();
const escalationPolicyFormState = escalationPolicyFormStore.$state;
const authorizationStore = useAuthorizationStore();
const { getReferenceLocation } = useReferenceRouter();

const state = reactive({
    projects: computed(() => allReferenceStore.getters.project),
    //
    resourceGroupLabels: computed<Record<EscalationPolicyModel['resource_group'], TranslateResult>>(() => ({
        WORKSPACE: i18n.t('MONITORING.ALERT.ESCALATION_POLICY.FORM.WORKSPACE'),
        PROJECT: i18n.t('MONITORING.ALERT.ESCALATION_POLICY.FORM.PROJECT'),
    })),
    resourceGroups: computed<{label: TranslateResult; value: EscalationPolicyModel['resource_group']}[]>(() => {
        const currentRoleType = authorizationStore.state.currentRoleInfo?.roleType;
        const resGroup: {label: TranslateResult; value: EscalationPolicyModel['resource_group']}[] = [
            { label: i18n.t('MONITORING.ALERT.ESCALATION_POLICY.FORM.PROJECT'), value: 'PROJECT' },
        ];
        if (currentRoleType === ROLE_TYPE.WORKSPACE_OWNER) {
            resGroup.splice(0, 0, { label: i18n.t('MONITORING.ALERT.ESCALATION_POLICY.FORM.WORKSPACE'), value: 'WORKSPACE' });
        }
        return resGroup;
    }),
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
const handleChangeResourceGroup = (value: EscalationPolicyModel['resource_group']) => {
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
    } else if (escalationPolicyData?.escalation_policy_id) {
        escalationPolicyFormStore.initEscalationPolicyFormData(escalationPolicyData);
        setForm('name', escalationPolicyFormState.name);
        setForm('projectId', escalationPolicyFormState.projectId);
    }
}, { immediate: true });
watch([() => escalationPolicyFormState.resourceGroup, () => invalidState.name, () => invalidState.projectId], ([resourceGroup, isNameInvalid, isProjectIdInvalid]) => {
    if (resourceGroup === 'WORKSPACE' || !props.showResourceGroup) {
        escalationPolicyFormStore.$patch({ isNameProjectIdFormValid: isNameInvalid === false });
    } else {
        escalationPolicyFormStore.$patch({ isNameProjectIdFormValid: isNameInvalid === false && isProjectIdInvalid === false });
    }
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
        <p-field-group v-if="props.showResourceGroup"
                       :label="$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.SCOPE')"
                       required
        >
            <template #default>
                <div v-if="props.mode === ACTION.create">
                    <p-radio v-for="(item, idx) in state.resourceGroups"
                             :key="idx"
                             :selected="item.value"
                             :value="escalationPolicyFormState.resourceGroup"
                             @change="handleChangeResourceGroup(item.value)"
                    >
                        {{ item.label }}
                    </p-radio>
                </div>
            </template>
            <template #label-extra>
                <span v-if="props.mode === ACTION.update"
                      class="resource-group-text"
                >
                    <span>{{ state.resourceGroupLabels[escalationPolicyFormState.resourceGroup] }}</span>
                    <span v-if="escalationPolicyFormState.resourceGroup === 'PROJECT'">
                        (<p-link action-icon="internal-link"
                                 new-tab
                                 :to="getReferenceLocation(escalationPolicyFormState.projectId,{
                                     resource_type: 'identity.Project',
                                     workspace_id: userWorkspaceStore.getters.currentWorkspaceId,
                                 })"
                                 :text="state.projects[escalationPolicyFormState.projectId] ? state.projects[escalationPolicyFormState.projectId].label : escalationPolicyFormState.projectId"
                                 highlight
                        />)
                    </span>
                </span>
            </template>
        </p-field-group>
        <p-field-group v-if="props.showResourceGroup && escalationPolicyFormState.resourceGroup === 'PROJECT' && props.mode === ACTION.create"
                       class="project-field"
                       required
                       :invalid="invalidState.projectId"
                       :invalid-text="invalidTexts.projectId"
        >
            <template #label>
                <span>{{ $t('MONITORING.ALERT.ESCALATION_POLICY.FORM.PROJECT_LABEL') }}</span>
                <p-link class="link-text"
                        action-icon="internal-link"
                        new-tab
                        size="sm"
                        :to="{ name: PROJECT_ROUTE_V1._NAME, params: { workspaceId: userWorkspaceStore.getters.currentWorkspaceId } }"
                        :text="$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.GO_CREATE_PROJECT')"
                        highlight
                />
            </template>
            <template #default="{invalid}">
                <project-select-dropdown project-selectable
                                         :project-group-selectable="false"
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
    .p-field-group {
        margin-bottom: 1rem;
    }

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
    .resource-group-text {
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
