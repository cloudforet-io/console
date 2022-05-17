<template>
    <tags-panel :resource-id="id"
                :disabled="!hasManagePermission"
                resource-key="project_id"
                resource-type="identity.Project"
                class="tab-bg"
    />
</template>

<script lang="ts">
import TagsPanel from '@/common/modules/tags/tags-panel/TagsPanel.vue';
import { computed, ref } from '@vue/composition-api';
import { store } from '@/store';

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
        const hasManagePermission = ref(computed<boolean>(() => store.getters['user/hasManagePermission']));
        return {
            hasManagePermission,
        };
    },
};
</script>
<style lang="postcss" scoped>
.tab-bg {
    @apply pb-0 border-none;
}
</style>
