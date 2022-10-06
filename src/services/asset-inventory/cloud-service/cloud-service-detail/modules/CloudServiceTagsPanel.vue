<template>
    <tags-panel :resource-id="resourceId"
                :disabled="disabled"
                resource-type="inventory.CloudService"
                resource-key="cloud_service_id"
                :tag-edit-page-visible.sync="tagEditPageVisible"
    >
        <template #extra>
            <div class="edit-button-container">
                <!--song-lang-->
                <p-button :outline="true"
                          icon="ic_edit"
                          style-type="primary1"
                          @click="handleTagEditPageVisible"
                >
                    {{ $t('Edit Custom Tags') }}
                </p-button>
            </div>
        </template>
        <template #table-top>
            <div class="tag-type-filter">
                <!--song-lang-->
                <span class="label">{{ $t('Type') }}</span>
                <p-select-status v-for="(status, idx) in tagTypeList" :key="`${status.name}-${idx}`"
                                 :selected="selectedTagType"
                                 :value="status.name"
                                 :multi-selectable="false"
                                 @change="handleSelectTagType"
                >
                    {{ status.label }}
                </p-select-status>
            </div>
        </template>
    </tags-panel>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from 'vue';

import { PButton, PSelectStatus } from '@spaceone/design-system';

import TagsPanel from '@/common/modules/tags/tags-panel/TagsPanel.vue';

import {
    CLOUD_SERVICE_TAG_TYPE,
    CLOUD_SERVICE_TAG_TYPE_BADGE_OPTION,
} from '@/services/asset-inventory/cloud-service/cloud-service-detail/config';

export default {
    name: 'CloudServiceTagsPanel',
    components: {
        PSelectStatus,
        PButton,
        TagsPanel,
    },
    props: {
        resourceId: {
            type: String,
            default: '',
            required: true,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    setup() {
        const state = reactive({
            tagTypeList: computed(() => [
                { name: 'all', label: 'All' },
                { name: CLOUD_SERVICE_TAG_TYPE.CUSTOM, label: CLOUD_SERVICE_TAG_TYPE_BADGE_OPTION[CLOUD_SERVICE_TAG_TYPE.CUSTOM].label },
                { name: CLOUD_SERVICE_TAG_TYPE.MANAGED, label: CLOUD_SERVICE_TAG_TYPE_BADGE_OPTION[CLOUD_SERVICE_TAG_TYPE.MANAGED].label },
            ]),
            selectedTagType: 'all',
            tagEditPageVisible: false,
        });
        /* event handler */
        const handleSelectTagType = (tagType) => { state.selectedTagType = tagType; };
        const handleTagEditPageVisible = () => { state.tagEditPageVisible = true; };
        return {
            ...toRefs(state),
            handleSelectTagType,
            handleTagEditPageVisible,
        };
    },
};
</script>

<style lang="postcss" scoped>
.edit-button-container {
    display: flex;
    justify-content: flex-end;
}
.tag-type-filter {
    @apply flex gap-4 items-center;
    padding: 1rem;
    font-size: 0.875rem;
    line-height: 125%;

    .label {
        @apply text-gray-500;
        font-size: 0.875rem;
    }
}
</style>
