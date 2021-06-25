<template>
    <div class="escalation-policy-form">
        <p-field-group
            :label="$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.NAME_LABEL')"
            required
            :invalid="!isNameValid"
            :invalid-text="nameInvalidText"
        >
            <p-text-input v-model="inputModel.name"
                          :invalid="!isNameValid"
                          class="w-1/2"
            />
        </p-field-group>
        <p-field-group
            v-if="showScope"
            :label="$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.SCOPE_LABEL')"
            required
        >
            <template #default>
                <div v-if="mode === ACTION.create">
                    <p-radio v-for="(item, idx) in scopes" :key="idx"
                             :selected="item.value"
                             :value="inputModel.scope"
                             @change="onChangeScope(item.value)"
                    >
                        <span class="radio-label">{{ item.label }}</span>
                    </p-radio>
                </div>
            </template>
            <template #label-extra>
                <span v-if="mode === ACTION.update" class="scope-text">
                    {{ inputModel.scope }}
                    <span v-if="inputModel.scope === SCOPE.project">
                        (<p-anchor :to="referenceRouter(inputModel.project_id,{ resource_type: 'identity.Project' })"
                                   :text="projects[inputModel.project_id] ? projects[inputModel.project_id].label : inputModel.project_id"
                                   :show-icon="true"
                                   highlight
                        />)
                    </span>
                </span>
            </template>
        </p-field-group>
        <p-field-group v-if="showScope && inputModel.scope === SCOPE.project && mode === ACTION.create"
                       class="project-field"
                       required
        >
            <template #label>
                <span>{{ $t('MONITORING.ALERT.ESCALATION_POLICY.FORM.PROJECT_LABEL') }}</span>
                <p-anchor class="link-text"
                          :to="{ name: PROJECT_ROUTE._NAME }"
                          :text="$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.GO_CREATE_PROJECT')"
                          :show-icon="true"
                          highlight
                />
            </template>
            <project-select-dropdown @select="onSelectProject" />
        </p-field-group>
        <p-field-group
            :label="$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.FINISH_CONDITION_LABEL')"
            required
        >
            <p-radio v-for="(item, idx) in finishConditions" :key="idx"
                     :selected="item.value"
                     :value="inputModel.finish_condition"
                     @change="onChangeFinishCondition(item.value)"
            >
                <span class="radio-label">{{ item.label }}</span>
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
            <escalation-rules-input-form
                :scope="inputModel.scope"
                :rules.sync="inputModel.rules"
                :repeat-count.sync="inputModel.repeat_count"
                :project-id="inputModel.project_id"
            />
        </p-field-group>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { cloneDeep } from 'lodash';

import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PFieldGroup, PRadio, PTextInput, PAnchor,
} from '@spaceone/design-system';

import EscalationRulesInputForm from '@/views/monitoring/alert-manager/modules/EscalationRulesInputForm.vue';
import ProjectSelectDropdown from '@/common/modules/project-select-dropdown/ProjectSelectDropdown.vue';

import {
    EscalationPolicyFormModel,
} from '@/views/monitoring/alert-manager/type';
import { ACTION, FINISH_CONDITION, SCOPE } from '@/views/monitoring/alert-manager/lib/config';
import { referenceRouter } from '@/lib/reference/referenceRouter';
import { PROJECT_ROUTE } from '@/routes/project/project-route';
import { store } from '@/store';


const DEFAULT_REPEAT_COUNT = 0;
const DEFAULT_NOTIFICATION_LEVEL = 'LV1';

export default {
    name: 'EscalationPolicyForm',
    components: {
        EscalationRulesInputForm,
        ProjectSelectDropdown,
        PFieldGroup,
        PTextInput,
        PRadio,
        PAnchor,
    },
    props: {
        mode: {
            type: String,
            default: undefined,
        },
        showScope: {
            type: Boolean,
            default: true,
        },
        escalationPolicy: {
            type: Object,
            default: undefined,
        },
        /* sync */
        isAllValid: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            projects: computed(() => store.state.resource.project.items),
            inputModel: {
                name: '',
                scope: SCOPE.global,
                rules: [{ notification_level: DEFAULT_NOTIFICATION_LEVEL, escalate_minutes: undefined }],
                finish_condition: FINISH_CONDITION.acknowledged,
                repeat_count: DEFAULT_REPEAT_COUNT,
                project_id: undefined,
            } as EscalationPolicyFormModel,
            showValidation: false,
            isNameValid: computed(() => !state.nameInvalidText),
            nameInvalidText: computed(() => {
                if (!state.showValidation) return undefined;
                if (!state.inputModel.name) {
                    return vm.$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.NAME_REQUIRED');
                }
                if (state.inputModel.name.length > 40) {
                    return vm.$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.NAME_INVALID_TEXT');
                }
                return undefined;
            }),
            scopes: computed(() => [
                {
                    label: vm.$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.GLOBAL'), value: SCOPE.global,
                }, {
                    label: vm.$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.PROJECT'), value: SCOPE.project,
                },
            ]),
            finishConditions: computed(() => [
                {
                    label: vm.$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.ACKNOWLEDGED'), value: FINISH_CONDITION.acknowledged,
                }, {
                    label: vm.$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.RESOLVED'), value: FINISH_CONDITION.resolved,
                },
            ]),
        });

        /* util */
        const initInputModel = () => {
            if (props.mode === ACTION.create) {
                state.inputModel.name = '';
                state.inputModel.scope = SCOPE.global;
                state.inputModel.rules = [{ notification_level: DEFAULT_NOTIFICATION_LEVEL, escalate_minutes: undefined }];
                state.inputModel.finish_condition = FINISH_CONDITION.acknowledged;
                state.inputModel.project_id = undefined;
                state.inputModel.repeat_count = DEFAULT_REPEAT_COUNT;
            } else if (props.mode === ACTION.update && props.escalationPolicy) {
                state.inputModel = cloneDeep(props.escalationPolicy);
            }
        };

        /* event */
        const onChangeInputModel = () => {
            state.showValidation = true;
            emit('update:is-all-valid', state.isNameValid);
            emit('change', state.inputModel);
        };
        const onChangeScope = (value) => {
            state.inputModel.scope = value;
            if (value === SCOPE.global) state.inputModel.project_id = undefined;
        };
        const onChangeFinishCondition = (value) => {
            state.inputModel.finish_condition = value;
        };
        const onSelectProject = (selected) => {
            state.inputModel.project_id = selected[0]?.id;
        };

        watch([() => props.mode, () => props.escalationPolicy], () => {
            initInputModel();
        }, { immediate: true });

        watch(() => state.inputModel, () => {
            onChangeInputModel();
        }, { deep: true });

        return {
            ...toRefs(state),
            referenceRouter,
            SCOPE,
            ACTION,
            PROJECT_ROUTE,
            onChangeScope,
            onChangeFinishCondition,
            onSelectProject,
        };
    },
};
</script>

<style lang="postcss" scoped>
.escalation-policy-form {
    .project-field::v-deep {
        .label-box {
            display: block;
            .form-label {
                display: flex;
                justify-content: space-between;
                align-items: center;
                .link-text {
                    font-weight: normal;
                    font-size: 0.75rem;
                }
            }
        }
    }
    .p-text-input {
        .input-container {
            border-radius: 0.25rem;
        }
    }
    .radio-label {
        font-size: 0.875rem;
        line-height: 1.2;

        &:first-child {
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
