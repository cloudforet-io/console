<template>
    <section class="event-rule-action-form">
        <p class="title-wrapper">
            <i18n path="PROJECT.EVENT_RULE.DO">
                <template #actions>
                    <strong>{{ $t('PROJECT.EVENT_RULE.THESE_THINGS') }}</strong>
                </template>
            </i18n>
        </p>
        <div class="content-wrapper">
            <div class="form-box">
                <p class="label">
                    {{ $t('PROJECT.EVENT_RULE.SNOOZED_NOTIFICATIONS') }}
                </p>
                <div>
                    <span v-if="proxyActions.no_notification" class="toggle-text">ON</span>
                    <p-toggle-button theme="secondary"
                                     sync
                                     :value="proxyActions.no_notification"
                                     @change="onToggleChange"
                    />
                </div>
            </div>
            <div class="form-box mobile-block">
                <p class="label">
                    {{ $t('PROJECT.EVENT_RULE.PROJECT_ROUTING') }}
                </p>
                <project-select-dropdown :selected-project-ids="actions.change_project ? [actions.change_project] : []"
                                         @select="onSelectProjectRouting"
                />
            </div>
            <div class="form-box mobile-block">
                <p class="label">
                    {{ $t('PROJECT.EVENT_RULE.PROJECT_DEPENDENCY') }}
                </p>
                <project-select-dropdown multi-selectable
                                         :selected-project-ids="actions.add_project_dependency || []"
                                         @select="onSelectProjectDependencies"
                />
            </div>
            <div class="form-box urgency">
                <p class="label">
                    {{ $t('PROJECT.EVENT_RULE.URGENCY') }}
                </p>
                <div>
                    <p-radio v-for="(urgency, uIdx) in urgencyList"
                             :key="`urgency-${uIdx}`"
                             v-model="formState.selectedUrgency"
                             :value="urgency.name"
                             class="mr-4"
                             @change="onChangeUrgency"
                    >
                        {{ urgency.label }}
                    </p-radio>
                    <p-select-dropdown v-model="formState.selectedUrgency" :items="urgencyList" />
                </div>
            </div>
            <div class="form-box mobile-block">
                <p class="label">
                    {{ $t('PROJECT.EVENT_RULE.ASSIGNEE') }}
                </p>
                <p-search-dropdown class="user-search-dropdown"
                                   type="radioButton"
                                   :menu="userItems"
                                   :selected="formState.assignee"
                                   use-fixed-menu-style
                />
            </div>
            <div class="form-box mobile-block">
                <p class="label">
                    {{ $t('PROJECT.EVENT_RULE.ADDITIONAL_RESPONDER') }}
                </p>
                <p-search-dropdown class="user-search-dropdown"
                                   type="checkbox"
                                   :menu="userItems"
                                   :selected="formState.responder"
                                   use-fixed-menu-style
                />
            </div>
            <div class="form-box additional-information">
                <tags-input-group ref="tagsRef"
                                  show-header
                                  :tags.sync="actions.add_additional_info"
                >
                    <template #addButton="{addPair}">
                        <div class="top-part">
                            <p>{{ $t('PROJECT.EVENT_RULE.ADDITIONAL_INFORMATION') }}</p>
                            <p-icon-text-button style-type="gray900" outline
                                                name="ic_plus_bold"
                                                class="mb-2"
                                                @click="addPair($event)"
                            >
                                {{ $t('PROJECT.EVENT_RULE.ADD') }}
                            </p-icon-text-button>
                        </div>
                    </template>
                </tags-input-group>
            </div>
        </div>
        <p-check-box v-model="proxyOptions.stop_processing"
                     :value="true"
                     class="stop-processing-input"
        >
            {{ $t('PROJECT.EVENT_RULE.THEN_STOP_PROCESSING') }}
        </p-check-box>
    </section>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { i18n } from '@/translations';

import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PToggleButton, PRadio, PIconTextButton, PCheckBox, PSelectDropdown, PSearchDropdown,
} from '@spaceone/design-system';

import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';
import TagsInputGroup from '@/common/components/forms/tags-input-group/TagsInputGroup.vue';

import { makeProxy } from '@spaceone/console-core-lib';
import { store } from '@/store';


const URGENCY = Object.freeze({
    NO_SET: 'NO_SET',
    HIGH: 'HIGH',
    LOW: 'LOW',
});

export default {
    name: 'EventRuleActionForm',
    components: {
        ProjectSelectDropdown,
        TagsInputGroup,
        PToggleButton,
        PRadio,
        PIconTextButton,
        PCheckBox,
        PSelectDropdown,
        PSearchDropdown,
    },
    props: {
        actions: {
            type: Object,
            default: () => ({}),
        },
        options: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            users: computed(() => store.state.resource.user.items),
            userItems: computed(() => Object.keys(state.users).map((k) => {
                const userName = state.users[k]?.name;
                return {
                    name: k,
                    label: userName ? `${k} (${userName})` : k,
                };
            })),
            tagsRef: null as any,
            urgencyList: computed(() => ([
                {
                    name: URGENCY.NO_SET,
                    label: i18n.t('PROJECT.EVENT_RULE.NO_SET'),
                },
                {
                    name: URGENCY.HIGH,
                    label: i18n.t('PROJECT.EVENT_RULE.HIGH'),
                },
                {
                    name: URGENCY.LOW,
                    label: i18n.t('PROJECT.EVENT_RULE.LOW'),
                },
            ])),
            proxyActions: makeProxy('actions', props, emit),
            proxyOptions: makeProxy('options', props, emit),
        });
        const formState = reactive({
            selectedUrgency: URGENCY.NO_SET,
            assignee: [] as string[],
            responder: [],
        });

        /* util */
        const initActionsData = (actions) => {
            if (actions.change_urgency) {
                formState.selectedUrgency = actions.change_urgency;
            } else {
                formState.selectedUrgency = URGENCY.NO_SET;
            }
            if (actions.change_assignee) formState.assignee = [actions.change_assignee];
            formState.responder = actions.add_responder.map(d => d.resource_id);
            state.tagsRef.init();
        };

        /* event */
        const onToggleChange = ({ value }) => {
            state.proxyActions.no_notification = value;
        };
        const onChangeUrgency = () => {
            if (formState.selectedUrgency === URGENCY.NO_SET) {
                state.proxyActions.change_urgency = undefined;
            } else {
                state.proxyActions.change_urgency = formState.selectedUrgency;
            }
        };
        const onSelectProjectRouting = (selected) => {
            state.proxyActions.change_project = selected[0]?.id;
        };
        const onSelectProjectDependencies = (selected) => {
            state.proxyActions.add_project_dependency = selected.map(d => d.id);
        };

        watch(() => formState.assignee, (assignee) => {
            state.proxyActions.change_assignee = assignee[0];
        });

        watch(() => formState.responder, (responder) => {
            state.proxyActions.add_responder = responder.map(d => ({ resource_type: 'identity.User', resource_id: d }));
        });

        watch(() => props.actions, (actions) => {
            initActionsData(actions);
        });

        watch(() => props.options, (options) => {
            state.proxyOptions = options;
        });

        return {
            ...toRefs(state),
            formState,
            onToggleChange,
            onChangeUrgency,
            onSelectProjectRouting,
            onSelectProjectDependencies,
        };
    },
};
</script>

<style lang="postcss" scoped>
.title-wrapper {
    font-size: 1rem;
    line-height: 2;
    margin-bottom: 0.75rem;
}
.content-wrapper {
    @apply border border-gray-100 rounded-md;
    border-width: 0.25rem;
    font-size: 0.875rem;

    .form-box {
        @apply border-b border-gray-100;
        display: flex;
        min-height: 3.5rem;
        line-height: 1.5;
        align-items: center;
        justify-content: space-between;
        border-bottom-width: 0.25rem;
        padding: 1rem;
        &:last-child {
            border: none;
        }
        &.urgency {
            .p-select-dropdown {
                display: none;
            }
        }
        &.additional-information::v-deep {
            display: block;
            .top-part {
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .tag-header {
                display: none;
            }
        }

        .toggle-text {
            @apply text-secondary;
            padding-right: 0.5rem;
        }
        .project-select-dropdown, .user-search-dropdown {
            width: 60%;
        }
        .user-search-dropdown::v-deep {
            .p-tag {
                .text {
                    @apply truncate;
                    max-width: 15rem;
                }
            }
        }
    }
}
.stop-processing-input {
    display: block;
    text-align: right;
    padding-top: 0.75rem;
}

@screen tablet {
    .content-wrapper {
        .form-box {
            &.urgency {
                .p-radio {
                    display: none;
                }
                .user-search-dropdown {
                    display: block;
                }
            }
        }
    }
}

@screen mobile {
    .content-wrapper {
        .form-box {
            &.mobile-block {
                display: block;
                .label {
                    padding-bottom: 0.75rem;
                }
                .project-select-dropdown, .user-search-dropdown {
                    width: 100%;
                }
            }
            &.additional-information::v-deep {
                .p-field-group {
                    width: 45%;
                }
            }
        }
    }
}
</style>
