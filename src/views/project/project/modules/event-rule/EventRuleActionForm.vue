<template>
    <section class="event-rule-action-form">
        <p class="title-wrapper">
            <strong>{{ $t('PROJECT.EVENT_RULE.DO') }}</strong> {{ $t('PROJECT.EVENT_RULE.THESE_THINGS') }}
        </p>
        <div class="content-wrapper">
            <div class="form-box">
                <p>{{ $t('PROJECT.EVENT_RULE.NOTIFICATIONS') }}</p>
                <div>
                    <span class="toggle-text" :class="{on: !proxyActions.no_notification}">
                        {{ proxyActions.no_notification ? $t('PROJECT.EVENT_RULE.PAUSE') : $t('PROJECT.EVENT_RULE.ON') }}
                    </span>
                    <p-toggle-button theme="secondary"
                                     :value="!proxyActions.no_notification"
                                     @change="onToggleChange"
                    />
                </div>
            </div>
            <div class="form-box">
                <p>{{ $t('PROJECT.EVENT_RULE.PROJECT_ROUTING') }}</p>
                <project-select-dropdown @select="onSelectProjectRouting" />
            </div>
            <div class="form-box">
                <p>{{ $t('PROJECT.EVENT_RULE.PROJECT_DEPENDENCIES') }}</p>
                <project-select-dropdown multi-selectable @select="onSelectProjectDependencies" />
            </div>
            <div class="form-box">
                <p>{{ $t('PROJECT.EVENT_RULE.URGENCY') }}</p>
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
                </div>
            </div>
            <div class="form-box">
                <p>{{ $t('PROJECT.EVENT_RULE.ASSIGNEE') }}</p>
                <search-or-select-user :multi-select="false" :selected-users.sync="formState.assignee" />
            </div>
            <div class="form-box">
                <p>{{ $t('PROJECT.EVENT_RULE.RESPONDER') }}</p>
                <search-or-select-user :selected-users.sync="formState.responder" />
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
    </section>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { i18n } from '@/translations';

import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PToggleButton, PRadio, PIconTextButton,
} from '@spaceone/design-system';

import ProjectSelectDropdown from '@/common/modules/project-select-dropdown/ProjectSelectDropdown.vue';
import SearchOrSelectUser from '@/common/modules/SearchOrSelectUser.vue';
import TagsInputGroup from '@/common/components/tags-input-group/TagsInputGroup.vue';

import { makeProxy } from '@/lib/compostion-util';


const URGENCY = Object.freeze({
    NO_SET: 'NO_SET',
    HIGH: 'HIGH',
    LOW: 'LOW',
});

export default {
    name: 'EventRuleActionForm',
    components: {
        SearchOrSelectUser,
        ProjectSelectDropdown,
        TagsInputGroup,
        PToggleButton,
        PRadio,
        PIconTextButton,
    },
    props: {
        actions: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props, { emit }) {
        const state = reactive({
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
            state.proxyActions.no_notification = !value;
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
        align-items: center;
        justify-content: space-between;
        border-bottom-width: 0.25rem;
        padding: 1rem;
        &:last-child {
            border: none;
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
            @apply text-gray-500;
            padding-right: 0.5rem;
            &.on {
                @apply text-secondary;
            }
        }
        .project-select-dropdown, .search-or-select-user {
            width: 60%;
        }
        .additional-info-wrapper {

        }
    }
}
</style>
