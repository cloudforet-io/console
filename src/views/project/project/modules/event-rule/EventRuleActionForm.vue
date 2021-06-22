<template>
    <section class="event-rule-action-form">
        <p class="title-wrapper">
            <strong>{{ $t('PROJECT.EVENT_RULE.DO') }}</strong> {{ $t('PROJECT.EVENT_RULE.THESE_THINGS') }}
        </p>
        <div class="content-wrapper">
            <div class="form-box">
                <p>{{ $t('PROJECT.EVENT_RULE.NOTIFICATIONS') }}</p>
                <div>
                    <span class="toggle-text" :class="{on: !actions.no_notification}">
                        {{ actions.no_notification ? $t('PROJECT.EVENT_RULE.PAUSE') : $t('PROJECT.EVENT_RULE.ON') }}
                    </span>
                    <p-toggle-button theme="secondary"
                                     :value="!actions.no_notification"
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
                             v-model="selectedUrgency"
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
                <search-or-select-user :multi-select="false" :selected-users.sync="assignee" />
            </div>
            <div class="form-box">
                <p>{{ $t('PROJECT.EVENT_RULE.RESPONDER') }}</p>
                <search-or-select-user :selected-users.sync="responder" />
            </div>
            <!--            <div class="form-box">-->
            <!--                <p>{{ $t('PROJECT.EVENT_RULE.ADDITIONAL_INFORMATION') }}</p>-->
            <!--                <p-icon-text-button style-type="gray900" name="ic_plus_bold"-->
            <!--                                    outline-->
            <!--                                    class="add-button"-->
            <!--                >-->
            <!--                    {{ $t('PROJECT.EVENT_RULE.ADD') }}-->
            <!--                </p-icon-text-button>-->
            <!--                <div v-for="(info, idx) in Object.keys(actions.add_additional_info)" :key="`additional-info-${idx}`"-->
            <!--                     class="additional-info-wrapper"-->
            <!--                >-->
            <!--                </div>-->
            <!--            </div>-->
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
    PToggleButton, PRadio,
} from '@spaceone/design-system';

import ProjectSelectDropdown from '@/common/modules/project-select-dropdown/ProjectSelectDropdown.vue';
import SearchOrSelectUser from '@/common/modules/SearchOrSelectUser.vue';


const URGENCY = Object.freeze({
    NO_SET: 'NO_SET',
    HIGH: 'HIGH',
    LOW: 'LOW',
});

type responder = {
    resource_type: string;
    resource_id: string;
}

interface Actions {
    change_assignee: string;
    change_urgency?: string;
    change_project: string;
    add_project_dependency: string[];
    add_responder: responder[];
    add_additional_info: Record<string, string>;
    no_notification: boolean;
}

export default {
    name: 'EventRuleActionForm',
    components: {
        SearchOrSelectUser,
        ProjectSelectDropdown,
        PToggleButton,
        PRadio,
    },
    props: {},
    setup(props, { emit }) {
        const state = reactive({
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
            selectedUrgency: URGENCY.NO_SET,
            assignee: [],
            responder: [],
            actions: {
                change_assignee: '',
                change_urgency: undefined,
                change_project: '',
                add_project_dependency: [],
                add_responder: [],
                add_additional_info: {},
                no_notification: true,
            } as Actions,
        });

        /* event */
        const onToggleChange = ({ value }) => {
            state.actions.no_notification = !value;
        };
        const onChangeUrgency = () => {
            if (state.selectedUrgency === URGENCY.NO_SET) {
                state.actions.change_urgency = undefined;
            } else {
                state.actions.change_urgency = state.selectedUrgency;
            }
        };
        const onSelectProjectRouting = (selected) => {
            state.actions.change_project = selected[0]?.id;
        };
        const onSelectProjectDependencies = (selected) => {
            state.actions.add_project_dependency = selected.map(d => d.id);
        };

        watch(() => state.actions, (actions) => {
            emit('change', actions);
        }, { immediate: true, deep: true });

        watch(() => state.assignee, (assignee) => {
            state.actions.change_assignee = assignee[0];
        });

        watch(() => state.responder, (responder) => {
            state.actions.add_responder = responder.map(d => ({ resource_type: 'identity.User', resource_id: d }));
        });

        return {
            ...toRefs(state),
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
