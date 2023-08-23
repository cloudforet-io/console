<script lang="ts" setup>
import { PLink } from '@spaceone/design-system';
import { ACTION_ICON } from '@spaceone/design-system/src/inputs/link/type';
import {
    computed, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import { referenceRouter } from '@/lib/reference/referenceRouter';

interface Props {
    data: any;
}

const props = withDefaults(defineProps<Props>(), {
    data: () => ({}),
});
const store = useStore();
const { t } = useI18n();

const state = reactive({
    fields: computed(() => ([
        { name: 'no_notification', label: t('PROJECT.EVENT_RULE.SNOOZED_NOTIFICATIONS') },
        { name: 'change_project', label: t('PROJECT.EVENT_RULE.PROJECT_ROUTING') },
        { name: 'add_project_dependency', label: t('PROJECT.EVENT_RULE.PROJECT_DEPENDENCY') },
        { name: 'change_urgency', label: t('PROJECT.EVENT_RULE.URGENCY') },
        { name: 'change_assignee', label: t('PROJECT.EVENT_RULE.ASSIGNEE') },
        { name: 'add_responder', label: t('PROJECT.EVENT_RULE.ADDITIONAL_RESPONDER') },
        { name: 'add_additional_info', label: t('PROJECT.EVENT_RULE.ADDITIONAL_INFORMATION') },
        { name: 'stop_processing', label: t('PROJECT.EVENT_RULE.THEN_STOP_PROCESSING') },
    ])),
    items: [] as any,
    projects: computed(() => store.getters['reference/projectItems']),
    conditions: computed(() => ({
        ANY: t('PROJECT.EVENT_RULE.ANY'),
        ALL: t('PROJECT.EVENT_RULE.ALL'),
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

</script>

<template>
    <div class="event-rule-content">
        <section class="left-section">
            <h4><b>{{ state.conditions[data.conditions_policy] }}</b> {{ t('PROJECT.EVENT_RULE.OF_THE_FOLLOWING_ARE_MET') }}</h4>
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
                <i18n-t keypath="PROJECT.EVENT_RULE.DO">
                    <template #actions>
                        <strong>{{ t('PROJECT.EVENT_RULE.THESE_THINGS') }}</strong>
                    </template>
                </i18n-t>
            </h4>
            <table>
                <tbody>
                    <template v-for="(item, index) in state.fields"
                              :key="`${item}-${index}`"
                    >
                        <tr v-if="state.items[item.name].length ||
                            item.name === 'stop_processing' && !!state.items[item.name] ||
                            item.name === 'add_additional_info' && Object.values(state.items[item.name]).length ||
                            item.name === 'no_notification' && state.items[item.name]"
                        >
                            <td>{{ item.label }}</td>
                            <td v-if="item.name === 'no_notification'">
                                <span class="text-secondary">{{ t('PROJECT.EVENT_RULE.ON') }}</span>
                            </td>
                            <td v-else-if="item.name === 'change_project'">
                                <p-link :action-icon="ACTION_ICON.INTERNAL_LINK"
                                        new-tab
                                        :to="referenceRouter(
                                            state.items[item.name],
                                            { resource_type: 'identity.Project' })"
                                >
                                    {{ state.projects[state.items[item.name]] ? state.projects[state.items[item.name]].label : state.items[item.name] }}
                                </p-link>
                            </td>
                            <td v-else-if="item.name === 'add_project_dependency'">
                                <p v-for="(projectId, idx) in state.items[item.name]"
                                   :key="`${projectId}-${idx}`"
                                   class="project-name"
                                >
                                    <p-link :action-icon="ACTION_ICON.INTERNAL_LINK"
                                            new-tab
                                            :to="referenceRouter(
                                                projectId,
                                                { resource_type: 'identity.Project' })"
                                    >
                                        {{ state.projects[projectId] ? state.projects[projectId].label : projectId }}
                                    </p-link>
                                </p>
                            </td>
                            <td v-else-if="item.name === 'add_responder'">
                                <p v-for="(user, idx) in state.items[item.name]"
                                   :key="`${user}-${idx}`"
                                   class="user-name"
                                >
                                    {{ user.resource_id }}
                                </p>
                            </td>
                            <td v-else-if="item.name === 'add_additional_info'">
                                <p v-for="(info, infoIdx) in Object.entries(state.items[item.name])"
                                   :key="`${info}-${infoIdx}`"
                                >
                                    <span class="font-bold">{{ info[0] }}</span>: {{ info[1] }}
                                </p>
                            </td>
                            <td v-else-if="item.name === 'stop_processing'"
                                class="stop-processing"
                            >
                                <span v-if="state.items[item.name]" />
                            </td>
                            <td v-else>
                                {{ state.items[item.name] }}
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </section>
    </div>
</template>

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
