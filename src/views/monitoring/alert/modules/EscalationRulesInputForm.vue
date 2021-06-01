<template>
    <div class="escalation-rules-input-form">
        <div class="label-wrapper">
            <span class="col-span-1 text-center">
                {{ $t('MONITORING.ALERT.ESCALATION_POLICY.FORM.STEP') }}
            </span>
            <span class="col-span-2">
                {{ $t('MONITORING.ALERT.ESCALATION_POLICY.FORM.NOTIFICATION_LEVEL') }}
            </span>
            <span class="col-span-4">
                {{ $t('MONITORING.ALERT.ESCALATION_POLICY.FORM.RULE') }}
            </span>
            <p-anchor class="link-text"
                      :text="$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.NOTIFICATION_SETTINGS')"
                      :to="{ name: IDENTITY_ROUTE.USER.NOTIFICATION.MAIN }"
                      highlight
            />
        </div>
        <div v-for="(rule, idx) in escalationRules"
             :key="`rule-${idx}`"
             class="content-wrapper"
        >
            <span class="col-span-1 step-wrapper">
                <p-badge outline style-type="gray">{{ idx + 1 }}</p-badge>
            </span>
            <span class="col-span-2 notification-wrapper">
                <p-select-dropdown
                    v-model="rule.notificationLevel"
                    :items="notificationLevels"
                />
            </span>
            <span v-if="rule.escalatesAfter"
                  class="col-span-4 rule-wrapper"
            >
                <span class="label">
                    {{ $t('MONITORING.ALERT.ESCALATION_POLICY.FORM.ESCALATES_AFTER') }}
                </span>
                <p-text-input v-model="rule.escalatesAfter"
                              class="rule-input"
                >
                    <template #right-extra>
                        {{ $t('MONITORING.ALERT.ESCALATION_POLICY.FORM.MIN') }}
                    </template>
                </p-text-input>
            </span>
            <p-icon-button
                class="delete-button"
                name="ic_trashcan"
                @click="onClickDeleteRule(idx)"
            />
        </div>
        <div class="add-wrapper">
            <span class="col-span-1 text-center">
                <p-i name="ic_repeat" />
            </span>
            <span class="col-span-2">
                <p-text-input v-model="repeatTime" class="repeat-input">
                    <template #right-extra>
                        {{ $t('MONITORING.ALERT.ESCALATION_POLICY.FORM.TIME') }}
                    </template>
                </p-text-input>
            </span>
            <span class="col-span-4">
                <span class="label">
                    {{ $t('MONITORING.ALERT.ESCALATION_POLICY.FORM.REPEAT') }}
                    <span class="text-gray-500">
                        ({{ $t('MONITORING.ALERT.ESCALATION_POLICY.FORM.REPEAT_LABEL_HELP_TEXT') }})
                    </span>
                </span>
            </span>
            <p-icon-text-button
                class="add-button"
                name="ic_plus_bold" outline
                style-type="gray900"
                :disabled="escalationRules.length >= 5"
                @click="onClickAddStep"
            >
                {{ $t('MONITORING.ALERT.ESCALATION_POLICY.FORM.ADD_STEP') }}
            </p-icon-text-button>
        </div>
    </div>
</template>

<script lang="ts">
import { reactive, toRefs } from '@vue/composition-api';

import {
    PAnchor, PBadge, PIconButton, PSelectDropdown, PI, PIconTextButton, PTextInput,
} from '@spaceone/design-system';

import { IDENTITY_ROUTE } from '@/routes/identity/identity-route';

export default {
    name: 'EscalationRulesInputForm',
    components: {
        PAnchor,
        PBadge,
        PIconButton,
        PSelectDropdown,
        PI,
        PIconTextButton,
        PTextInput,
    },
    setup() {
        const state = reactive({
            repeatTime: undefined,
            escalationRules: [
                {
                    notificationLevel: 'all',
                    escalatesAfter: 10,
                },
                {
                    notificationLevel: 'all',
                    escalatesAfter: 15,
                },
                {
                    notificationLevel: 'all',
                    escalatesAfter: undefined,
                },
            ],
            notificationLevels: [
                {
                    label: 'All',
                    name: 'all',
                },
                {
                    label: 'Level 1',
                    name: 'level1',
                },
                {
                    label: 'Level 2',
                    name: 'level1',
                },
            ],
        });

        const onClickDeleteRule = async (idx) => {
            await state.escalationRules.splice(idx, 1);
            const lastItem = state.escalationRules[state.escalationRules.length - 1];
            lastItem.escalatesAfter = undefined;
        };
        const onClickAddStep = () => {
            state.escalationRules[state.escalationRules.length - 1].escalatesAfter = 10;
            state.escalationRules.push({
                notificationLevel: 'all',
                escalatesAfter: undefined,
            });
        };

        return {
            ...toRefs(state),
            IDENTITY_ROUTE,
            onClickDeleteRule,
            onClickAddStep,
        };
    },
};
</script>

<style lang="postcss" scoped>
.escalation-rules-input-form {
    @apply bg-gray-100 border border-gray-200;
    border-radius: 0.375rem;
    padding: 0.5rem;

    .label-wrapper {
        @apply text-gray-400 grid grid-cols-12;
        position: relative;
        font-size: 0.75rem;
        font-weight: bold;
        line-height: 1.5;
        margin-bottom: 0.5rem;

        .link-text {
            position: absolute;
            right: 0;
        }
    }

    .content-wrapper {
        @apply bg-white grid grid-cols-12;
        position: relative;
        height: 3rem;
        align-items: center;
        border-radius: 0.25rem;
        vertical-align: middle;
        margin-bottom: 0.25rem;
        padding: 0.5rem 0;

        .step-wrapper {
            margin: auto;
        }
        .notification-wrapper {
            .p-select-dropdown::v-deep {
                .p-dropdown-button {
                    min-width: 6rem;
                }
            }
        }
        .rule-wrapper {
            .label {
                @apply text-gray-900;
                font-size: 0.875rem;
                line-height: 1.4;
                padding-right: 0.5rem;
            }
            .rule-input {
                width: 6rem;
            }
        }
        .delete-button {
            position: absolute;
            right: 0.5rem;
            top: 0.5rem;
        }
    }

    .add-wrapper {
        @apply grid grid-cols-12;
        position: relative;
        align-items: center;
        padding: 0.5rem 0;

        .repeat-input {
            width: 6rem;
        }
        .label {
            @apply text-gray-900;
            font-size: 0.875rem;
        }
        .add-button {
            position: absolute;
            right: 0;
            border-radius: 0.25rem;
        }
    }
}
</style>
