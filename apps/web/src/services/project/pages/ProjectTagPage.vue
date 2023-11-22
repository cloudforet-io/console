<template>
    <tags-panel :resource-id="id"
                :disabled="!hasManagePermission"
                resource-key="project_id"
                resource-type="identity.Project"
                class="tab-bg"
    />
</template>

<script lang="ts">
import { useManagePermissionState } from '@/common/composables/page-manage-permission';
import TagsPanel from '@/common/modules/tags/tags-panel/TagsPanel.vue';

export default {
    name: 'ProjectTagPage',
    components: {
        TagsPanel,
    },
    props: {
        id: {
            type: String,
            default: undefined,
        },
    },
    setup() {
        return {
            hasManagePermission: useManagePermissionState(),
        };
    },
};
</script>
<style lang="postcss" scoped>
.tab-bg {
    @apply pb-0 border-none;
}
</style>
