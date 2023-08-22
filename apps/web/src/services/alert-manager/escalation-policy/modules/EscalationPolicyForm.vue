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
        <p-field-group v-if="showScope"
                       :label="$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.SCOPE_LABEL')"
                       required
        >
            <template #default>
                <div v-if="mode === ACTION.create">
                    <p-radio v-for="(item, idx) in scopes"
                             :key="idx"
                             :selected="item.value"
                             :value="escalationPolicyFormState.scope"
                             @change="handleChangeScope(item.value)"
                    >
                        {{ item.label }}
                    </p-radio>
                </div>
            </template>
            <template #label-extra>
                <span v-if="mode === ACTION.update"
                      class="scope-text"
                >
                    <span>{{ scopeLabels[escalationPolicyFormState.scope] || escalationPolicyFormState.scope }}</span>
                    <span v-if="escalationPolicyFormState.scope === SCOPE.PROJECT">
                        (<p-link :action-icon="ACTION_ICON.INTERNAL_LINK"
                                 new-tab
                                 :to="referenceRouter(escalationPolicyFormState.projectId,{ resource_type: 'identity.Project' })"
                                 :text="projects[escalationPolicyFormState.projectId] ? projects[escalationPolicyFormState.projectId].label : escalationPolicyFormState.projectId"
                                 highlight
                        />)
                    </span>
                </span>
            </template>
        </p-field-group>
        <p-field-group v-if="showScope && escalationPolicyFormState.scope === SCOPE.PROJECT && mode === ACTION.create"
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
            <p-radio v-for="(item, idx) in finishConditions"
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
            <escalation-rules-input-form />
        </p-field-group>
    </div>
</template>

<script lang="ts">

import type { PropType } from 'vue';
import {
    computed, reactive, toRefs, watch,
} from 'vue';

import {
    PLink, PFieldGroup, PRadio, PTextInput,
} from '@spaceone/design-system';
import { ACTION_ICON } from '@spaceone/design-system/src/inputs/link/type';

import { store } from '@/store';
import { i18n } from '@/translations';

import { referenceRouter } from '@/lib/reference/referenceRouter';

import { useFormValidator } from '@/common/composables/form-validator';
import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

import EscalationRulesInputForm from '@/services/alert-manager/escalation-policy/modules/EscalationRulesInputForm.vue';
import { useEscalationPolicyFormStore } from '@/services/alert-manager/escalation-policy/store/escalation-policy-form';
import { ACTION, FINISH_CONDITION, SCOPE } from '@/services/alert-manager/lib/config';
import type { EscalationPolicyDataModel } from '@/services/alert-manager/type';
import { PROJECT_ROUTE } from '@/services/project/route-config';


export default {
    name: 'EscalationPolicyForm',
    components: {
        EscalationRulesInputForm,
        ProjectSelectDropdown,
        PFieldGroup,
        PTextInput,
        PRadio,
        PLink,
    },
    props: {
        mode: {
            type: String,
            default: ACTION.create,
        },
        showScope: {
            type: Boolean,
            default: true,
        },
        escalationPolicyData: {
            type: Object as PropType<EscalationPolicyDataModel>,
            default: () => ({}),
        },
    },
    setup(props) {
        const escalationPolicyFormStore = useEscalationPolicyFormStore();
        const escalationPolicyFormState = escalationPolicyFormStore.$state;
        const state = reactive({
            projects: computed(() => store.getters['reference/projectItems']),
            //
            scopeLabels: computed(() => ({
                [SCOPE.DOMAIN]: i18n.t('MONITORING.ALERT.ESCALATION_POLICY.FORM.GLOBAL'),
                [SCOPE.PROJECT]: i18n.t('MONITORING.ALERT.ESCALATION_POLICY.FORM.PROJECT'),
            })),
            scopes: computed(() => [
                { label: i18n.t('MONITORING.ALERT.ESCALATION_POLICY.FORM.GLOBAL'), value: SCOPE.DOMAIN },
                { label: i18n.t('MONITORING.ALERT.ESCALATION_POLICY.FORM.PROJECT'), value: SCOPE.PROJECT },
            ]),
            finishConditions: computed(() => [
                { label: i18n.t('MONITORING.ALERT.ESCALATION_POLICY.FORM.ACKNOWLEDGED'), value: FINISH_CONDITION.acknowledged },
                { label: i18n.t('MONITORING.ALERT.ESCALATION_POLICY.FORM.RESOLVED'), value: FINISH_CONDITION.resolved },
            ]),
        });

        const {
            forms: {
                name,
                projectId,
            },
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
                if (escalationPolicyFormState.scope === SCOPE.DOMAIN) return true;
                if (!value) return i18n.t('MONITORING.ALERT.ESCALATION_POLICY.FORM.PROJECT_REQUIRED');
                return true;
            },
        });

        /* event */
        const handleChangeScope = (value) => {
            escalationPolicyFormStore.$patch({ scope: value });
            if (value === SCOPE.DOMAIN) {
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
        const handleSelectProject = (selected) => {
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

        // LOAD REFERENCE STORE
        (async () => {
            await store.dispatch('reference/project/load');
        })();

        return {
            ...toRefs(state),
            escalationPolicyFormState,
            referenceRouter,
            SCOPE,
            ACTION,
            ACTION_ICON,
            PROJECT_ROUTE,
            handleChangeScope,
            handleChangeFinishCondition,
            handleUpdateName,
            handleSelectProject,
            //
            name,
            projectId,
            invalidState,
            invalidTexts,
            isAllValid,
            setForm,
        };
    },
};
</script>

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
