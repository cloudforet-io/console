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
            <p-anchor v-if="scope === 'PROJECT'"
                      class="link-text"
                      :text="$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.NOTIFICATION_SETTINGS')"
                      :to="{ name: IDENTITY_ROUTE.USER.NOTIFICATION._NAME }"
                      highlight
            />
        </div>
        <div v-for="(rule, idx) in rules" :key="`rule-${idx}`" class="content-row">
            <span class="col-step">
                <p-badge outline style-type="gray">{{ idx + 1 }}</p-badge>
            </span>
            <span class="col-notification">
                <p-select-dropdown v-model="rule.notification_level" :items="NOTIFICATION_LEVELS">
                    <template #menu-item--format="{item}">
                        <p-radio v-model="rule.notification_level"
                                 :value="item.name"
                        >
                            <div class="item">
                                <p>{{ item.label }}</p>
                                <project-channel-list :project-channels="projectChannels" :notification-level="item.name" />
                            </div>
                        </p-radio>
                    </template>
                </p-select-dropdown>
            </span>
            <span v-if="rule.escalate_minutes" class="col-rule">
                <span class="label">
                    {{ $t('MONITORING.ALERT.ESCALATION_POLICY.FORM.ESCALATES_AFTER') }}
                </span>
                <p-text-input v-model.number="rule.escalate_minutes"
                              class="rule-input"
                >
                    <template #right-extra>
                        {{ $t('MONITORING.ALERT.ESCALATION_POLICY.FORM.MIN') }}
                    </template>
                </p-text-input>
            </span>
            <div class="col-mobile-input">
                <span class="label">
                    {{ $t('MONITORING.ALERT.ESCALATION_POLICY.FORM.NOTIFICATION_LV') }}
                </span>
                <span class="input">
                    <p-select-dropdown v-model="rule.notification_level" :items="MINIFIED_NOTIFICATION_LEVELS">
                        <template #menu-item--format="{item}">
                            <p-radio v-model="rule.notification_level"
                                     :value="item.name"
                            >
                                <div class="item">
                                    <p>{{ item.label }}</p>
                                    <project-channel-list :project-channels="projectChannels" :notification-level="item.name" />
                                </div>
                            </p-radio>
                        </template>
                    </p-select-dropdown>
                </span>
                <template v-if="rule.escalate_minutes">
                    <span class="label">
                        {{ $t('MONITORING.ALERT.ESCALATION_POLICY.FORM.ESCALATES_AFTER') }}
                    </span>
                    <span class="input">
                        <p-text-input v-model.number="rule.escalate_minutes" type="number" class="rule-input">
                            <template #right-extra>
                                {{ $t('MONITORING.ALERT.ESCALATION_POLICY.FORM.MIN') }}
                            </template>
                        </p-text-input>
                    </span>
                </template>
            </div>
            <p-icon-button
                class="delete-button"
                name="ic_trashcan"
                @click="onClickDeleteRule(idx)"
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
                <p-text-input v-model.number="proxyRepeatCount"
                              type="number"
                              :min="0"
                              class="repeat-input"
                >
                    <template #right-extra>
                        {{ $t('MONITORING.ALERT.ESCALATION_POLICY.FORM.TIME') }}
                    </template>
                </p-text-input>
            </span>
            <span class="col-label">
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
                :disabled="rules.length >= 5"
                @click="onClickAddStep"
            >
                {{ $t('MONITORING.ALERT.ESCALATION_POLICY.FORM.ADD_STEP') }}
            </p-icon-text-button>
        </div>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { reactive, toRefs, watch } from '@vue/composition-api';

import {
    PAnchor, PBadge, PIconButton, PSelectDropdown, PI, PIconTextButton, PTextInput, PRadio,
} from '@spaceone/design-system';

import ProjectChannelList from '@/views/monitoring/alert-manager/components/ProjectChannelList.vue';

import { IDENTITY_ROUTE } from '@/routes/identity/identity-route';
import { makeProxy } from '@/lib/compostion-util';
import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';


const NOTIFICATION_LEVELS = Object.freeze([
    { name: 'ALL', label: 'All' },
    { name: 'LV1', label: 'Level 1' },
    { name: 'LV2', label: 'Level 2' },
    { name: 'LV3', label: 'Level 3' },
    { name: 'LV4', label: 'Level 4' },
    { name: 'LV5', label: 'Level 5' },
]);
const MINIFIED_NOTIFICATION_LEVELS = Object.freeze([
    { name: 'ALL', label: 'All' },
    { name: 'LV1', label: '1' },
    { name: 'LV2', label: '2' },
    { name: 'LV3', label: '3' },
    { name: 'LV4', label: '4' },
    { name: 'LV5', label: '5' },
]);

export default {
    name: 'EscalationRulesInputForm',
    components: {
        ProjectChannelList,
        PAnchor,
        PBadge,
        PIconButton,
        PSelectDropdown,
        PI,
        PIconTextButton,
        PTextInput,
        PRadio,
    },
    props: {
        scope: {
            type: String,
            default: '',
        },
        rules: {
            type: Array,
            default: () => ([]),
        },
        repeatCount: {
            type: Number,
            default: 0,
        },
        projectId: {
            type: String,
            default: undefined,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            proxyRepeatCount: makeProxy('repeatCount', props, emit),
            projectChannels: [],
        });

        /* api */
        const apiQuery = new ApiQueryHelper();
        const getQuery = () => {
            apiQuery
                .setFilters([{ k: 'project_id', v: props.projectId, o: '=' }]);
            return apiQuery.data;
        };
        const listProjectChannel = async () => {
            try {
                const { results } = await SpaceConnector.client.notification.projectChannel.list({ query: getQuery() });
                state.projectChannels = results;
            } catch (e) {
                state.projectChannels = [];
                console.error(e);
            }
        };

        /* event */
        const onClickDeleteRule = (idx) => {
            const rules = props.rules;
            rules.splice(idx, 1);
            if (rules.length > 0) rules[rules.length - 1].escalate_minutes = undefined;
            emit('update:rules', rules);
        };
        const onClickAddStep = () => {
            const rules = props.rules;
            if (rules.length > 0) rules[rules.length - 1].escalate_minutes = 30;
            rules.push({
                notification_level: NOTIFICATION_LEVELS[rules.length + 1].name,
                escalate_minutes: undefined,
            });
            emit('update:rules', rules);
        };

        watch(() => props.projectId, (projectId) => {
            if (projectId) listProjectChannel();
        }, { immediate: true });

        return {
            ...toRefs(state),
            IDENTITY_ROUTE,
            NOTIFICATION_LEVELS,
            MINIFIED_NOTIFICATION_LEVELS,
            onClickDeleteRule,
            onClickAddStep,
        };
    },
};
</script>

<style lang="postcss" scoped>
.escalation-rules-input-form {
    @apply bg-gray-100 border border-gray-200 rounded-lg;
    min-height: 21.75rem;
    padding: 0.5rem;

    .label-row {
        @apply text-gray-400 grid grid-cols-12;
        position: relative;
        font-size: 0.75rem;
        font-weight: bold;
        line-height: 1.5;
        margin-bottom: 0.5rem;

        .col-step {
            @apply col-span-1;
            text-align: center;
        }
        .col-notification {
            @apply col-span-2;
        }
        .col-rule {
            @apply col-span-4;
        }
        .link-text {
            position: absolute;
            right: 0;
        }
    }

    .content-row {
        @apply bg-white grid grid-cols-12 rounded-md;
        position: relative;
        height: 3rem;
        align-items: center;
        vertical-align: middle;
        margin-bottom: 0.25rem;
        padding: 0.5rem 0;

        .col-step {
            @apply col-span-1;
            margin: auto;
        }
        .col-notification {
            @apply col-span-2;
        }
        .col-rule {
            @apply col-span-5;

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
        @apply grid grid-cols-12;
        position: relative;
        align-items: center;
        font-size: 0.875rem;
        padding: 0.5rem 0;

        .col-icon {
            @apply col-span-1;
            text-align: center;
        }
        .col-mobile-label {
            display: none;
        }
        .col-input {
            @apply col-span-2;
            .repeat-input {
                width: 6rem;
            }
        }
        .col-label {
            @apply col-span-5 text-gray-900;
        }

        .add-button {
            position: absolute;
            right: 0;
            border-radius: 0.25rem;
        }
    }

    .p-select-dropdown::v-deep {
        .p-dropdown-button {
            min-width: 6rem;
        }
        .context-item {
            @apply border-b border-secondary;
            box-sizing: border-box;
            &:last-child {
                border: none;
            }
        }
        .p-radio {
            display: flex;
            .item {
                margin-left: 0.25rem;
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
                @apply col-span-2;
            }
            .col-notification, .col-rule {
                display: none;
            }
        }
        .content-row {
            height: auto;
            .col-step {
                @apply col-span-2;
                height: 100%;
                padding-top: 0.375rem;
            }
            .col-notification, .col-rule {
                display: none;
            }
            .col-mobile-input {
                @apply col-span-8 grid grid-cols-8 text-gray-900;
                row-gap: 0.5rem;
                font-size: 0.75rem;

                .label {
                    @apply col-span-4;
                    margin: auto 0;
                }
                .input {
                    @apply col-span-4;
                    .p-select-dropdown::v-deep {
                        .p-dropdown-button {
                            min-width: 100%;
                        }
                    }
                    .rule-input {
                        width: 100%;
                    }
                }
            }
        }
        .add-row {
            .col-icon {
                @apply col-span-2;
            }
            .col-mobile-label {
                @apply col-span-4 text-gray-900;
                display: block;
                font-size: 0.75rem;
            }
            .col-input {
                @apply col-span-4;
                .repeat-input {
                    width: 100%;
                }
            }
            .col-label {
                display: none;
            }
            .add-button {
                @apply col-span-12;
                position: relative;
                margin-top: 0.75rem;
            }
        }
    }
}
</style>
