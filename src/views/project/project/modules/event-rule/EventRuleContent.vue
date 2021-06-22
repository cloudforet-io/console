<template>
    <fragment>
        <section class="left-section">
            {{ data.conditions_policy }} of the following are met
            <ul v-for="(condition, idx) in data.conditions" :key="`${condition}-${idx}`" class="condition-list">
                <li>{{ condition.key }} {{ condition.operator }} {{ condition.value }}</li>
            </ul>
        </section>
        <section class="right-section">
            <p-definition-table :fields="fields" :data="data" :skeleton-rows="9"
                                :disable-copy="true" :style-type="'white'"
            >
                <template #data-actions.no_notification>
                    <span v-if="data.actions.no_notification">On</span>
                    <span v-else>Off</span>
                </template>
                <template #data-project_id>
                    <p-anchor :to="referenceRouter(
                                  data.project_id,
                                  { resource_type: 'identity.Project' })"
                              highlight
                    >
                        {{ projects[data.project_id] ? projects[data.project_id].label : data.project_id }}
                    </p-anchor>
                </template>
                <template #data-actions.add_project_dependency>
                    <p v-for="(item, index) in data.actions.add_project_dependency" :key="`${item}-${index}`"
                       class="project-name"
                    >
                        <p-anchor :to="referenceRouter(
                                      item,
                                      { resource_type: 'identity.Project' })"
                                  highlight
                        >
                            {{ projects[item] ? projects[item].label : item }}
                        </p-anchor>
                    </p>
                </template>
                <template #data-actions.add_responder>
                    <p v-for="(item, index) in data.actions.add_responder" :key="`${item}-${index}`">
                        {{ item.resource_id }}
                    </p>
                </template>
                <template #data-options.stop_processing>
                    <span />
                </template>
            </p-definition-table>
        </section>
    </fragment>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from '@vue/composition-api';
import { PAnchor, PDefinitionTable } from '@spaceone/design-system';
import { referenceRouter } from '@/lib/reference/referenceRouter';
import { store } from '@/store';

export default {
    name: 'EventRuleContent',
    components: {
        PDefinitionTable,
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
                { name: 'actions.no_notification', label: 'Notifications' },
                { name: 'project_id', label: 'Project Routing' },
                { name: 'actions.add_project_dependency', label: 'Project Dependencies' },
                { name: 'actions.change_urgency', label: 'Urgency' },
                { name: 'actions.change_assignee', label: 'Assignee' },
                { name: 'actions.add_responder', label: 'Responder' },
                { name: 'options.stop_processing', label: 'Then Stop Processing' },
            ],
            projects: computed(() => store.state.resource.project.items),
        });

        (async () => {
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
.left-section {
    @apply col-span-4;
    .condition-list {
        list-style: disc;
    }
}
.right-section {
    @apply col-span-8;
}
@screen tablet {
    .left-section {
        @apply col-span-12;
    }
    .right-section {
        @apply col-span-12;
    }
}
.p-definition-table::v-deep {
    border-width: 0;
}
</style>
