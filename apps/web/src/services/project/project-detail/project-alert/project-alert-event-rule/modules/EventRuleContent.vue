<template>
    <div class="event-rule-content">
        <section class="left-section">
            <h4><b>{{ conditions[data.conditions_policy] }}</b> {{ $t('PROJECT.EVENT_RULE.OF_THE_FOLLOWING_ARE_MET') }}</h4>
            <ul v-for="(condition, idx) in data.conditions"
                :key="`${condition}-${idx}`"
                class="condition-list"
            >
                <li>
                    <span class="text-blue-900 capitalize">{{ condition.key }}</span>
                    {{ condition.operator }}
                    <span class="text-blue-900">{{ condition.value }}</span>
                </li>
            </ul>
        </section>
        <section class="right-section">
            <h4>
                <i18n path="PROJECT.EVENT_RULE.DO">
                    <template #actions>
                        <strong>{{ $t('PROJECT.EVENT_RULE.THESE_THINGS') }}</strong>
                    </template>
                </i18n>
            </h4>
            <table>
                <tbody>
                    <template v-for="(item, index) in fields">
                        <tr v-if="items[item.name].length ||
                                item.name === 'stop_processing' && !!items[item.name] ||
                                item.name === 'add_additional_info' && Object.values(items[item.name]).length ||
                                item.name === 'no_notification' && items[item.name]"
                            :key="`${item}-${index}`"
                        >
                            <td>{{ item.label }}</td>
                            <td v-if="item.name === 'no_notification'">
                                <span class="text-secondary">{{ $t('PROJECT.EVENT_RULE.ON') }}</span>
                            </td>
                            <td v-else-if="item.name === 'change_project'">
                                <p-anchor :to="referenceRouter(
                                    items[item.name],
                                    { resource_type: 'identity.Project' })"
                                >
                                    {{ projects[items[item.name]] ? projects[items[item.name]].label : items[item.name] }}
                                </p-anchor>
                            </td>
                            <td v-else-if="item.name === 'add_project_dependency'">
                                <p v-for="(projectId, idx) in items[item.name]"
                                   :key="`${projectId}-${idx}`"
                                   class="project-name"
                                >
                                    <p-anchor :to="referenceRouter(
                                        projectId,
                                        { resource_type: 'identity.Project' })"
                                    >
                                        {{ projects[projectId] ? projects[projectId].label : projectId }}
                                    </p-anchor>
                                </p>
                            </td>
                            <td v-else-if="item.name === 'add_responder'">
                                <p v-for="(user, idx) in items[item.name]"
                                   :key="`${user}-${idx}`"
                                   class="user-name"
                                >
                                    {{ user.resource_id }}
                                </p>
                            </td>
                            <td v-else-if="item.name === 'add_additional_info'">
                                <p v-for="(info, infoIdx) in Object.entries(items[item.name])"
                                   :key="`${info}-${infoIdx}`"
                                >
                                    <span class="font-bold">{{ info[0] }}</span>: {{ info[1] }}
                                </p>
                            </td>
                            <td v-else-if="item.name === 'stop_processing'"
                                class="stop-processing"
                            >
                                <span v-if="items[item.name]" />
                            </td>
                            <td v-else>
                                {{ items[item.name] }}
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </section>
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from 'vue';

import { PAnchor } from '@spaceone/design-system';

import { store } from '@/store';
import { i18n } from '@/translations';

import { referenceRouter } from '@/lib/reference/referenceRouter';

export default {
    name: 'EventRuleContent',
    components: {
        PAnchor,
    },
    props: {
        data: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props) {
        const state = reactive({
            fields: computed(() => ([
                { name: 'no_notification', label: i18n.t('PROJECT.EVENT_RULE.SNOOZED_NOTIFICATIONS') },
                { name: 'change_project', label: i18n.t('PROJECT.EVENT_RULE.PROJECT_ROUTING') },
                { name: 'add_project_dependency', label: i18n.t('PROJECT.EVENT_RULE.PROJECT_DEPENDENCY') },
                { name: 'change_urgency', label: i18n.t('PROJECT.EVENT_RULE.URGENCY') },
                { name: 'change_assignee', label: i18n.t('PROJECT.EVENT_RULE.ASSIGNEE') },
                { name: 'add_responder', label: i18n.t('PROJECT.EVENT_RULE.ADDITIONAL_RESPONDER') },
                { name: 'add_additional_info', label: i18n.t('PROJECT.EVENT_RULE.ADDITIONAL_INFORMATION') },
                { name: 'stop_processing', label: i18n.t('PROJECT.EVENT_RULE.THEN_STOP_PROCESSING') },
            ])),
            items: [] as any,
            projects: computed(() => store.getters['reference/projectItems']),
            conditions: computed(() => ({
                ANY: i18n.t('PROJECT.EVENT_RULE.ANY'),
                ALL: i18n.t('PROJECT.EVENT_RULE.ALL'),
            })),
        });

        const getData = () => {
            state.items = { ...props.data.change_project, ...props.data.actions, ...props.data.options };
        };

        watch(() => props.data, () => {
            getData();
        }, { immediate: false });

        (async () => {
            getData();
            // LOAD REFERENCE STORE
            await store.dispatch('reference/project/load');
        })();

        return {
            ...toRefs(state),
            referenceRouter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.event-rule-content {
    @apply grid grid-cols-12;
    gap: 2rem;
}

h4 {
    font-size: 1rem;
    line-height: 160%;
}
.left-section {
    @apply col-span-4;
    .condition-list {
        list-style: disc;
        font-size: 1rem;
        line-height: 160%;

        li {
            margin-left: 1.5rem;
            line-height: 150%;
            font-size: 0.875rem;
        }
    }
}
.right-section {
    @apply col-span-8;
}
table {
    display: flex;
    width: 100%;
    td, th {
        @apply px-4 py-2;
    }

    tbody {
        width: 100%;
        tr {
            @apply border-gray-300 border-b;
            td, th {
                width: 100%;
                vertical-align: top;
                &:first-child {
                    @apply text-gray-500;
                    font-size: 0.875rem;
                    line-height: 150%;
                    width: 11rem;
                    flex-shrink: 0;
                }
                &:last-child {
                    font-size: 0.875rem;
                    line-height: 150%;
                }
            }
            td {
                &:first-child {
                    min-width: 11rem;
                }
            }
        }
    }
}

@screen tablet {
    .left-section {
        @apply col-span-12;
    }
    .right-section {
        @apply col-span-12;
        margin-top: 1rem;
    }
}
</style>
