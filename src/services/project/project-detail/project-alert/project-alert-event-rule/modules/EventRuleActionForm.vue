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
                <project-select-dropdown :selected-project-ids.sync="routingProjects" />
            </div>
            <div class="form-box mobile-block">
                <p class="label">
                    {{ $t('PROJECT.EVENT_RULE.PROJECT_DEPENDENCY') }}
                </p>
                <project-select-dropdown multi-selectable
                                         :selected-project-ids.sync="dependentProjects"
                />
            </div>
            <div class="form-box urgency">
                <p class="label">
                    {{ $t('PROJECT.EVENT_RULE.URGENCY') }}
                </p>
                <div>
                    <p-radio v-for="(urgency, uIdx) in urgencyList"
                             :key="`urgency-${uIdx}`"
                             v-model="selectedUrgency"
                             :value="urgency.name"
                             class="mr-4"
                    >
                        {{ urgency.label }}
                    </p-radio>
                    <p-select-dropdown v-model="selectedUrgency" :items="urgencyList" />
                </div>
            </div>
            <div class="form-box mobile-block">
                <p class="label">
                    {{ $t('PROJECT.EVENT_RULE.ASSIGNEE') }}
                </p>
                <p-search-dropdown class="user-search-dropdown"
                                   type="radioButton"
                                   :menu="userItems"
                                   :selected.sync="selectedAssignee"
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
                                   :selected.sync="selectedResponder"
                                   use-fixed-menu-style
                />
            </div>
            <div class="form-box additional-information">
                <tags-input-group show-header
                                  :tags.sync="additionalInfoTags"
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
import { i18n } from '@/translations';

import {
    computed, reactive, toRefs,
} from '@vue/composition-api';

import {
    PToggleButton, PRadio, PIconTextButton, PCheckBox, PSelectDropdown, PSearchDropdown,
} from '@spaceone/design-system';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';

import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

import TagsInputGroup from '@/common/components/forms/tags-input-group/TagsInputGroup.vue';
import { makeProxy } from '@/lib/helper/composition-helpers';
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
            userItems: computed(() => Object.keys(state.users).map(k => ({
                name: k,
                label: state.users[k]?.label || k,
            }))),
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
            routingProjects: computed<string[]>({
                get() { return props.actions.change_project ? [props.actions.change_project] : []; },
                set(projectIds) {
                    state.proxyActions = {
                        ...state.proxyActions,
                        change_project: projectIds[0],
                    };
                },
            }),
            dependentProjects: computed<string[]>({
                get() { return props.actions.add_project_dependency || []; },
                set(projectIds) {
                    state.proxyOptions = {
                        ...state.proxyOptions,
                        add_project_dependency: projectIds,
                    };
                },
            }),
            selectedUrgency: computed({
                get() {
                    if (props.actions.change_urgency) {
                        return props.actions.change_urgency;
                    }
                    return URGENCY.NO_SET;
                },
                set(changeUrgency) {
                    state.proxyActions = {
                        ...state.proxyActions,
                        change_urgency: changeUrgency !== URGENCY.NO_SET ? changeUrgency : undefined,
                    };
                },
            }),
            selectedAssignee: computed<MenuItem[]>({
                get() {
                    const assignee: string = props.actions.change_assignee;
                    return assignee ? [{ name: assignee, label: assignee }] : [];
                },
                set(items) {
                    state.proxyActions = {
                        ...state.proxyActions,
                        change_assignee: items[0]?.name,
                    };
                },
            }),
            selectedResponder: computed<MenuItem[]>({
                get() {
                    return props.actions.add_responder.map(d => ({
                        name: d.resource_id,
                        label: d.resource_id,
                    }));
                },
                set(items) {
                    state.proxyActions = {
                        ...state.proxyActions,
                        add_responder: items.map(item => ({
                            resource_type: 'identity.User',
                            resource_id: item.name,
                        })),
                    };
                },
            }),
            additionalInfoTags: computed({
                get() { return props.actions.add_additional_info; },
                set(tags) {
                    state.proxyActions = {
                        ...state.proxyActions,
                        add_additional_info: tags,
                    };
                },
            }),
        });


        /* event */
        const onToggleChange = ({ value }) => {
            state.proxyActions = {
                ...state.proxyActions,
                no_notification: value,
            };
        };


        return {
            ...toRefs(state),
            onToggleChange,
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
