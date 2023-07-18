<script lang="ts" setup>
import { useManagePermissionState } from '@/common/composables/page-manage-permission';
import TagsPanel from '@/common/modules/tags/tags-panel/TagsPanel.vue';

interface Props {
    id: string;
}

defineProps<Props>();
const hasManagePermission = useManagePermissionState();

</script>

<template>
    <tags-panel :resource-id="id"
                :disabled="!hasManagePermission"
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
