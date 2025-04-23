<script setup lang="ts">
import {
    reactive, computed, onMounted,
} from 'vue';

import { isEmpty } from 'lodash';

import {
    PButtonModal,
} from '@cloudforet/mirinae';


import { useProxyValue } from '@/common/composables/proxy-state';
import type { Tag } from '@/common/modules/tags/type';

import ProjectTagsInputGroup from '@/services/project/v-shared/components/ProjectTagsInputGroup.vue';

interface Props {
    visible?: boolean;
    projectId?: string;
    tags?: Tag;
    loading?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
    projectId: undefined,
    tags: () => ({}),
    loading: false,
});

const emit = defineEmits<{(e: 'update', tags: Tag): void;
    (e: 'close'): void;
}>();

const state = reactive({
    loading: false,
    proxyVisible: useProxyValue('visible', props, emit),
    newTags: { },
    isTagsValid: false,
    noItem: computed(() => isEmpty(state.newTags)),
});

/* Api */
const handleSaveTags = async () => {
    if (!state.isTagsValid) return;
    emit('update', state.newTags);
};

/* Event */
const handleUpdateTags = (tags?: Tag) => {
    state.newTags = tags;
};

/* Init */
onMounted(() => {
    state.newTags = { ...props.tags };
});
</script>

<template>
    <p-button-modal
        class="project-tags-modal"
        modal-body-id="project-tags"
        :header-title="$t('PROJECT.DETAIL.UPDATE_TAG')"
        :fade="true"
        :backdrop="true"
        size="sm"
        :visible.sync="state.proxyVisible"
        :disabled="!state.isTagsValid"
        @confirm="handleSaveTags"
    >
        <template #body>
            <p class="description">
                {{ $t('PROJECT.DETAIL.UPDATE_TAG_DESC') }}
            </p>
            <project-tags-input-group :tags="state.newTags"
                                      :disabled="props.loading"
                                      show-validation
                                      :is-valid.sync="state.isTagsValid"
                                      @update-tags="handleUpdateTags"
            />
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.project-tags-modal {
    .description {
        @apply text-paragraph-md text-gray-900;
        white-space: pre-wrap;
    }
}
</style>
