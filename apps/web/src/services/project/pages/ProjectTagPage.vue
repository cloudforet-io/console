<script lang="ts" setup>
import TagsPanel from '@/common/modules/tags/tags-panel/TagsPanel.vue';


interface Props {
    id?: string;
}
const props = withDefaults(defineProps<Props>(), {
    id: '',
});
</script>

<template>
    <tags-panel :resource-id="props.id"
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
