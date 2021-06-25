<template>
    <div class="event-rule-content">
        <section class="left-section">
            <h4><b>{{ data.conditions_policy }}</b> {{$t('PROJECT.EVENT_RULE.OF_THE_FOLLOWING_ARE_MET')}}</h4>
            <ul v-for="(condition, idx) in data.conditions" :key="`${condition}-${idx}`" class="condition-list">
                <li>
                    <span class="text-blue-800">{{ condition.key }}</span>
                    {{ condition.operator }}
                    <span class="text-blue-800">{{ condition.value }}</span>
                </li>
            </ul>
        </section>
        <section class="right-section">
            <h4><b>{{$t('PROJECT.EVENT_RULE.DO')}}</b> {{$t('PROJECT.EVENT_RULE.THESE_THINGS')}}</h4>
            <table>
                <tbody>
                    <tr v-for="(item, index) in fields" :key="`${item}-${index}`">
                        <template v-if="items[item.name].length ||
                            item.name === 'stop_processing' && !!items[item.name] ||
                            item.name === 'no_notification'"
                        >
                            <td>{{ item.label }}</td>
                            <td v-if="item.name === 'no_notification'">
                                <span v-if="items[item.name]">{{$t('PROJECT.EVENT_RULE.PAUSE')}}</span>
                                <span v-else>On</span>
                            </td>
                            <td v-else-if="item.name === 'change_project'">
                                <p-anchor :to="referenceRouter(
                                              items[item],
                                              { resource_type: 'identity.Project' })"
                                          highlight
                                >
                                    {{ projects[items[item.name]] ? projects[items[item.name]].label : items[item.name] }}
                                </p-anchor>
                            </td>
                            <td v-else-if="item.name === 'add_project_dependency'">
                                <p v-for="(projectId, idx) in items[item.name]" :key="`${projectId}-${idx}`"
                                   class="project-name"
                                >
                                    <p-anchor :to="referenceRouter(
                                                  projectId,
                                                  { resource_type: 'identity.Project' })"
                                              highlight
                                    >
                                        {{ projects[projectId] ? projects[projectId].label : projectId }}
                                    </p-anchor>
                                </p>
                            </td>
                            <td v-else-if="item.name === 'add_responder'">
                                <p v-for="(user, idx) in items[item.name]" :key="`${user}-${idx}`" class="user-name">
                                    {{ user.resource_id }}
                                </p>
                            </td>
                            <td v-else-if="item.name === 'stop_processing'">
                                <span v-if="items[item.name]" />
                            </td>
                            <td v-else>
                                {{ items[item.name] }}
                            </td>
                        </template>
                    </tr>
                </tbody>
            </table>
        </section>
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import { PAnchor } from '@spaceone/design-system';
import { referenceRouter } from '@/lib/reference/referenceRouter';
import { store } from '@/store';

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
            fields: [
                { name: 'no_notification', label: 'Notifications' },
                { name: 'change_project', label: 'Project Routing' },
                { name: 'add_project_dependency', label: 'Project Dependencies' },
                { name: 'change_urgency', label: 'Urgency' },
                { name: 'change_assignee', label: 'Assignee' },
                { name: 'add_responder', label: 'Responder' },
                { name: 'stop_processing', label: 'Then Stop Processing' },
            ],
            items: [] as any,
            projects: computed(() => store.state.resource.project.items),
        });

        const getData = () => {
            state.items = { ...props.data.change_project, ...props.data.actions, ...props.data.options };
        };

        watch(() => props.data, () => {
            getData();
        }, { immediate: false });

        (async () => {
            getData();
            await store.dispatch('resource/project/load');
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

    thead {
        tr {
            th, td {
                @apply border-black border-t border-b font-bold;
            }
        }
    }

    tbody {
        width: 100%;
        tr {
            @apply border-gray-300 border-b;
            td, th {

                width: 100%;
                &:first-child {
                    @apply text-gray-500;
                    font-size: 0.875rem;
                    line-height: 150%;
                    width: 11rem;
                }
                &:last-child {
                    font-size: 0.875rem;
                    line-height: 150%;
                }
            }
            &:last-child {
                @apply border-none;
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
