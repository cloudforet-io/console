<script setup lang="ts">
import {
    reactive, watch,
} from 'vue';

import { cloneDeep } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PLink, PBadge, PIconButton, PSelectDropdown, PI, PButton, PTextInput, PRadio, PFieldGroup,
} from '@cloudforet/mirinae';


import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import { RESOURCE_GROUP } from '@/api-clients/_common/schema/constant';
import type { EscalationPolicyRule } from '@/schema/monitoring/escalation-policy/type';
import type { ProjectChannelListParameters } from '@/schema/notification/project-channel/api-verbs/list';
import type { ProjectChannelModel } from '@/schema/notification/project-channel/model';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import ProjectChannelList from '@/services/alert-manager/v1/components/ProjectChannelList.vue';
import { useEscalationPolicyFormStore } from '@/services/alert-manager/v1/stores/escalation-policy-form-store';
import { PROJECT_ROUTE_V1 } from '@/services/project/v1/routes/route-constant';

const NOTIFICATION_LEVELS: {name: EscalationPolicyRule['notification_level']; label: string}[] = [
    { name: 'ALL', label: 'All' },
    { name: 'LV1', label: 'Level 1' },
    { name: 'LV2', label: 'Level 2' },
    { name: 'LV3', label: 'Level 3' },
    { name: 'LV4', label: 'Level 4' },
    { name: 'LV5', label: 'Level 5' },
];
const MINIFIED_NOTIFICATION_LEVELS: {name: EscalationPolicyRule['notification_level']; label: string}[] = [
    { name: 'ALL', label: 'All' },
    { name: 'LV1', label: '1' },
    { name: 'LV2', label: '2' },
    { name: 'LV3', label: '3' },
    { name: 'LV4', label: '4' },
    { name: 'LV5', label: '5' },
];
const DEFAULT_NOTIFICATION_LEVEL = 'LV1';

const userWorkspaceStore = useUserWorkspaceStore();

const escalationPolicyFormStore = useEscalationPolicyFormStore();
const escalationPolicyFormState = escalationPolicyFormStore.$state;
const state = reactive({
    projectChannels: [] as ProjectChannelModel[],
});

const {
    forms: {
        repeatCount,
        rules,
    },
    setForm,
    invalidState,
    invalidTexts,
    isAllValid,
    resetValidations,
} = useFormValidator({
    repeatCount: 0,
    rules: [{
        notification_level: DEFAULT_NOTIFICATION_LEVEL,
        escalate_minutes: undefined,
    }] as EscalationPolicyRule[],
}, {
    repeatCount(value) {
        if (value === undefined) return true;
        if (Number.isNaN(value) || typeof value !== 'number') return 'Only numbers are allowed.';
        if (value < 0) return 'Must be 0 or greater.';
        return true;
    },
    rules(value: EscalationPolicyRule[]) {
        let result = '';
        value.forEach((d, idx) => {
            if (!repeatCount.value && idx === value.length - 1) return;
            if (d?.escalate_minutes === undefined) result = 'Only numbers are allowed.';
            else if (d?.escalate_minutes < 0) result = 'Must be 0 or greater.';
        });
        return result;
    },
});

/* api */
const apiQuery = new ApiQueryHelper();
const listProjectChannel = async (projectId: string) => {
    try {
        apiQuery.setFilters([{ k: 'project_id', v: projectId, o: '=' }]);
        const { results } = await SpaceConnector.clientV2.notification.projectChannel.list<ProjectChannelListParameters, ListResponse<ProjectChannelModel>>({ query: apiQuery.data });
        state.projectChannels = results ?? [];
    } catch (e) {
        ErrorHandler.handleError(e);
        state.projectChannels = [];
    }
};

/* util */
const showEscalatesAfterForm = (idx: number) => {
    if (idx < rules.value.length - 1) return true;
    return repeatCount.value > 0;
};

/* event */
const handleDeleteRule = (idx: number) => {
    const _rules = cloneDeep(rules.value);
    _rules.splice(idx, 1);
    if (_rules.length > 0 && !repeatCount.value) _rules[_rules.length - 1].escalate_minutes = undefined;
    setForm('rules', _rules);
};
const handleAddStep = () => {
    const _rules = cloneDeep(rules.value);
    if (_rules.length > 0 && !repeatCount.value) _rules[_rules.length - 1].escalate_minutes = 30;
    _rules.push({
        notification_level: NOTIFICATION_LEVELS[_rules.length + 1].name,
        escalate_minutes: repeatCount.value > 0 ? 30 : undefined,
    });
    setForm('rules', _rules);
};
const handleUpdateRepeatCount = (_repeatCount: number) => {
    const _after = Number(_repeatCount);
    const _before = repeatCount.value;
    const _rules = cloneDeep(rules.value);
    //
    if (!_before && _after > 0) _rules[_rules.length - 1].escalate_minutes = 30;
    if (!_after) _rules[_rules.length - 1].escalate_minutes = undefined;
    setForm('rules', _rules);
    setForm('repeatCount', _after);
};

watch(() => escalationPolicyFormState.projectId, (projectId) => {
    if (projectId) listProjectChannel(projectId);
});
watch(() => escalationPolicyFormState.escalationPolicyData?.escalation_policy_id, (escalationPolicyId) => {
    if (escalationPolicyId) {
        setForm('repeatCount', escalationPolicyFormState.repeatCount ?? 0);
        setForm('rules', escalationPolicyFormState.rules);
        resetValidations();
    }
}, { immediate: true });
watch(() => rules.value, (_rules) => {
    escalationPolicyFormStore.$patch({ rules: _rules });
}, { deep: true, immediate: true });
watch(() => repeatCount.value, (_repeatCount) => {
    escalationPolicyFormStore.$patch({ repeatCount: _repeatCount });
}, { immediate: true });
watch(() => isAllValid.value, (_isAllValid) => {
    escalationPolicyFormStore.$patch({ isEscalationRulesFormValid: _isAllValid });
}, { immediate: true });
</script>

<template>
    <div class="escalation-rules-input-form">
        <div class="label-row">
            <span class="col-step">
                {{ $t('MONITORING.ALERT.ESCALATION_POLICY.FORM.STEP') }}
            </span>
            <span class="col-notification">
                {{ $t('MONITORING.ALERT.ESCALATION_POLICY.FORM.NOTIFICATION_LEVEL') }}
            </span>
            <span class="col-rule">
                {{ $t('MONITORING.ALERT.ESCALATION_POLICY.FORM.RULE') }}
            </span>
            <p-link v-if="escalationPolicyFormState.resourceGroup === RESOURCE_GROUP.PROJECT && escalationPolicyFormState.projectId"
                    class="link-text"
                    action-icon="internal-link"
                    new-tab
                    :text="$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.NOTIFICATIONS_SETTINGS')"
                    :to="{ name: PROJECT_ROUTE_V1.DETAIL.TAB.NOTIFICATIONS._NAME, params: {
                        id: escalationPolicyFormState.projectId,
                        workspaceId: userWorkspaceStore.getters.currentWorkspaceId
                    } }"
                    highlight
            />
        </div>
        <div v-for="(rule, idx) in rules"
             :key="`rule-${idx}`"
             class="content-row"
        >
            <span class="col-step">
                <p-badge badge-type="solid-outline"
                         style-type="gray500"
                >{{ idx + 1 }}</p-badge>
            </span>
            <span class="col-notification">
                <p-select-dropdown :selected="rule.notification_level"
                                   :menu="NOTIFICATION_LEVELS"
                                   use-fixed-menu-style
                >
                    <template #menu-item--format="{item}">
                        <p-radio v-model="rule.notification_level"
                                 :value="item.name"
                        >
                            <p>{{ item.label }}</p>
                            <project-channel-list :project-channels="state.projectChannels"
                                                  :notification-level="item.name"
                            />
                        </p-radio>
                    </template>
                </p-select-dropdown>
            </span>

            <i18n v-if="showEscalatesAfterForm(idx)"
                  :path="idx === rules.length - 1 ? 'MONITORING.ALERT.ESCALATION_POLICY.FORM.REPEAT_AFTER' : 'MONITORING.ALERT.ESCALATION_POLICY.FORM.ESCALATES_AFTER'"
                  class="col-rule"
            >
                <template #default="value">
                    <strong>{{ value }}</strong>
                </template>
                <template #minute>
                    <p-field-group required
                                   :invalid="rule.escalate_minutes < 0"
                                   class="rule-input-wrapper"
                    >
                        <template #default="{invalid}">
                            <p-text-input v-model.number="rule.escalate_minutes"
                                          type="number"
                                          :min="0"
                                          :invalid="invalid"
                                          class="rule-input"
                            />
                        </template>
                    </p-field-group>
                </template>
            </i18n>
            <div class="col-mobile-input">
                <span class="label">
                    {{ $t('MONITORING.ALERT.ESCALATION_POLICY.FORM.NOTIFICATION_LV') }}
                </span>
                <span class="input">
                    <p-select-dropdown :selected="rule.notification_level"
                                       :menu="MINIFIED_NOTIFICATION_LEVELS"
                                       use-fixed-menu-style
                    >
                        <template #menu-item--format="{item}">
                            <p-radio v-model="rule.notification_level"
                                     :value="item.name"
                            >
                                <div class="item">
                                    <p>{{ item.label }}</p>
                                    <project-channel-list :project-channels="state.projectChannels"
                                                          :notification-level="item.name"
                                    />
                                </div>
                            </p-radio>
                        </template>
                    </p-select-dropdown>
                </span>
                <i18n v-if="showEscalatesAfterForm(idx)"
                      :path="idx === rules.length - 1 ? 'MONITORING.ALERT.ESCALATION_POLICY.FORM.REPEAT_AFTER' : 'MONITORING.ALERT.ESCALATION_POLICY.FORM.ESCALATES_AFTER'"
                      class="col-mobile-rule"
                >
                    <template #minute>
                        <p-field-group required
                                       :invalid="rule.escalate_minutes < 0"
                        >
                            <template #default="{invalid}">
                                <p-text-input v-model.number="rule.escalate_minutes"
                                              type="number"
                                              :min="0"
                                              :invalid="invalid"
                                              class="rule-input"
                                />
                            </template>
                        </p-field-group>
                    </template>
                </i18n>
            </div>
            <p-icon-button
                v-if="rules.length > 1"
                class="delete-button"
                name="ic_delete"
                @click="handleDeleteRule(idx)"
            />
        </div>
        <div class="add-row">
            <span class="col-icon">
                <p-i name="ic_repeat" />
            </span>
            <span class="col-mobile-label">
                {{ $t('MONITORING.ALERT.ESCALATION_POLICY.FORM.REPEAT_ALL') }}
            </span>
            <span class="col-input">
                <p-field-group required
                               :invalid="invalidState.repeatCount"
                               :invalid-text="invalidTexts.repeatCount"
                >
                    <template #default="{invalid}">
                        <p-text-input :value="repeatCount"
                                      type="number"
                                      :min="0"
                                      class="repeat-input"
                                      :invalid="invalid"
                                      @update:value="handleUpdateRepeatCount"
                        />
                    </template>
                </p-field-group>
            </span>
            <span class="col-label">
                <span class="label">
                    {{ $t('MONITORING.ALERT.ESCALATION_POLICY.FORM.REPEAT') }}
                    <span class="text-gray-500">
                        ({{ $t('MONITORING.ALERT.ESCALATION_POLICY.FORM.REPEAT_LABEL_HELP_TEXT') }})
                    </span>
                </span>
            </span>
            <p-button class="add-button"
                      icon-left="ic_plus_bold"
                      style-type="tertiary"
                      :disabled="rules.length >= 5"
                      @click="handleAddStep"
            >
                {{ $t('MONITORING.ALERT.ESCALATION_POLICY.FORM.ADD_RULE') }}
            </p-button>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.escalation-rules-input-form {
    @apply bg-gray-100 border border-gray-200 rounded-lg;
    min-height: 21.75rem;
    padding: 0.5rem;

    .label-row {
        @apply relative flex text-gray-400;
        font-size: 0.75rem;
        font-weight: bold;
        line-height: 1.5;
        margin-bottom: 0.5rem;

        .col-step {
            text-align: center;
            width: 3.625rem;
        }
        .col-notification {
            width: 7.5rem;
        }
        .col-rule {
            @apply col-span-3;
        }
        .link-text {
            position: absolute;
            right: 0;
            font-weight: normal;
        }
    }

    .content-row {
        @apply relative flex items-center align-middle bg-white rounded-md;
        height: 3rem;
        margin-bottom: 0.25rem;
        padding: 0.5rem 0.75rem 0.5rem 1rem;
        gap: 1rem;

        .col-step {
            margin-right: 0.25rem;
        }
        .col-notification {
            .p-select-dropdown {
                min-width: 6.5rem;
            }
        }
        .col-rule {
            @apply flex justify-start items-center text-gray-900;
            gap: 0.5rem;
            font-size: 0.875rem;
            line-height: 1.4;

            /* custom design-system component - p-text-input */
            :deep(.p-text-input) {
                width: 6rem;
            }

            .rule-input-wrapper {
                margin-bottom: 0;
            }
        }
        .col-mobile-input {
            display: none;
        }
        .delete-button {
            position: absolute;
            right: 0.5rem;
            top: 0.5rem;
        }
    }

    .add-row {
        @apply relative flex items-center;
        font-size: 0.875rem;
        padding: 0.5rem 0.75rem 0.5rem 1rem;
        gap: 1.25rem;

        .col-icon {
            @apply col-span-1;
            text-align: center;
        }
        .col-mobile-label {
            display: none;
        }
        .col-input {
            @apply col-span-2;
            .p-field-group {
                margin-bottom: 0;
            }

            .repeat-input {
                width: 6.5rem;
            }
        }
        .col-label {
            @apply col-span-5 text-gray-900;
        }

        .add-button {
            @apply rounded-md;
            position: absolute;
            right: 0;
        }
    }

    /* custom design-system component - p-select-dropdown */
    :deep(.p-select-dropdown) {
        min-width: 6rem;
        .context-item {
            @apply border-b border-secondary;
            box-sizing: border-box;
            width: 100%;
            &:last-child {
                border: none;
            }
        }
        .p-radio {
            display: flex;
            width: 100%;
            .p-i-icon {
                margin-top: 0.125rem;
            }
            .text {
                padding-left: 0.25rem;
                .project-channel-list {
                    @apply bg-transparent;
                    padding: 0;
                }
            }
        }
    }

    @screen mobile {
        min-height: auto;

        .label-row {
            .col-step {
                grid-column: span 2 / span 2;
            }
            .col-notification, .col-rule {
                display: none;
            }
        }
        .content-row {
            height: auto;
            .col-step {
                grid-column: span 2 / span 2;
                height: 100%;
                padding-top: 0.375rem;
            }
            .col-notification, .col-rule {
                display: none;
            }
            .col-mobile-input {
                grid-column: span 8 / span 8;
                display: grid;
                grid-template-columns: repeat(8, minmax(0, 1fr));

                --tw-text-opacity: 1;
                color: rgb(35 37 51 / var(--tw-text-opacity, 1));
                row-gap: 0.5rem;
                font-size: 0.75rem;

                .label {
                    grid-column: span 4 / span 4;
                    margin: auto 0;
                }
                .input {
                    grid-column: span 4 / span 4;

                    /* custom design-system component - p-select-dropdown */
                    :deep(.p-select-dropdown) {
                        min-width: 100%;
                    }
                    .rule-input {
                        width: 6rem;
                    }
                }
                .col-mobile-rule {
                    grid-column: span 8 / span 8;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    .rule-input {
                        width: 50%;
                        min-width: 6rem;
                    }
                }
            }
        }
        .add-row {
            .col-icon {
                grid-column: span 2 / span 2;
            }
            .col-mobile-label {
                --tw-text-opacity: 1;
                color: rgb(35 37 51 / var(--tw-text-opacity, 1));
                grid-column: span 4 / span 4;
                display: block;
                font-size: 0.75rem;
            }
            .col-input {
                grid-column: span 4 / span 4;
                .repeat-input {
                    width: 6rem;
                }
            }
            .col-label {
                display: none;
            }
            .add-button {
                grid-column: span 12 / span 12;
                position: relative;
                margin-top: 0.75rem;
            }
        }
    }
}
</style>
