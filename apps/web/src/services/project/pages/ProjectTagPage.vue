<script lang="ts" setup>
import TagsPanel from '@/common/modules/tags/tags-panel/TagsPanel.vue';

import { useProjectPageStore } from '@/services/project/stores/project-page-store';


interface Props {
    id?: string;
}
const props = defineProps<Props>();
const projectPageStore = useProjectPageStore();
const projectPageState = projectPageStore.state;
</script>

<template>
    <tags-panel :resource-id="props.id"
                :disabled="!projectPageState.isWorkspaceOwner"
                resource-key="project_id"
                resource-type="identity.Project"
                class="tab-bg"
    />
</template>

<style lang="postcss" scoped>
.tab-bg {
    @apply pb-0 border-none;
}
</style>
