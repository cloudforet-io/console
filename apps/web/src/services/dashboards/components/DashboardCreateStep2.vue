<script lang="ts" setup>

import {
    PLabel, PLazyImg,
} from '@spaceone/design-system';

import DashboardCreateScopeForm from '@/services/dashboards/components/DashboardCreateScopeForm.vue';
import type { DashboardModel } from '@/services/dashboards/types/dashboard-api-schema-type';
import type { ProjectTreeNodeData } from '@/services/project/types/project-tree-type';

interface Props {
    selectedTemplate: DashboardModel;
}

const props = withDefaults(defineProps<Props>(), {
    selectedTemplate: undefined,
});

const emit = defineEmits<{(e: 'select-project', value: ProjectTreeNodeData): void}>();

const handleSelectProject = (project: ProjectTreeNodeData) => {
    emit('select-project', project);
};
</script>

<template>
    <div class="dashboard-create-step2">
        <div class="selected-ootb-wrapper">
            <p-lazy-img :src="props.selectedTemplate?.description?.icon ?? 'ic_dashboard-template_blank'"
                        width="3.5rem"
                        height="3.5rem"
            />
            <div class="description-wrapper">
                <p class="description-title">
                    {{ props.selectedTemplate.name }}
                </p>
                <div class="label-wrapper">
                    <p-label v-for="(label, idx) in props.selectedTemplate.labels"
                             :key="`${label}-${idx}`"
                             :text="label"
                    />
                </div>
            </div>
        </div>
        <dashboard-create-scope-form @set-project="handleSelectProject" />
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-create-step2 {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}
.field-title {
    padding-bottom: 0.75rem;
}
.selected-ootb-wrapper {
    display: flex;
    gap: 1rem;
    .description-wrapper {
        display: grid;
        align-items: center;
        padding: 0.25rem 0;
        .description-title {
            @apply text-label-lg;
            font-weight: 500;
        }
    }
}
</style>
