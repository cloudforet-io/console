<script setup lang="ts">
import {
    reactive,
} from 'vue';


import {
    PFieldGroup, POverlayLayout, PTextInput, PButton, PDivider,
} from '@cloudforet/mirinae';

import { useProxyValue } from '@/common/composables/proxy-state';

import LandingWorkspaceGroupTab from '@/services/landing/components/LandingWorkspaceGroupTab.vue';



interface Props {
    isOverlayOpen: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    isOverlayOpen: false,
});
const emit = defineEmits<{(e: 'update:is-overlay-open'): void}>();

const state = reactive({
    isOverlayOpenProxy: useProxyValue('isOverlayOpen', props, emit),
    name: '',
});

const handleSave = () => {
    console.log('Save');
};
</script>

<template>
    <p-overlay-layout :visible.sync="state.isOverlayOpenProxy"
                      :title="$t('LADING.WORKSPACE_GROUP_SETTINGS')"
                      style-type="primary"
                      size="lg"
                      class="workspace-group-manage-overlay"
    >
        <div class="contents-wrapper">
            <p-field-group :label="$t('LADING.NAME')"
                           :invalid-text="$t('LADING.DUPLICATE_NAME_ERROR')"
                           color="dark"
                           font-weight="bold"
                           size="md"
                           required
                           class="title"
            >
                <div class="name-field-contents">
                    <p-text-input v-model="state.name"
                                  placeholder="Name"
                                  required
                                  class="name-input"
                    /><p-button style-type="primary"
                                size="md"
                                @click="handleSave"
                    >
                        {{ $t('LADING.SAVE_CHANGES') }}
                    </p-button>
                </div>
            </p-field-group>
            <landing-workspace-group-tab class="workspace-group-tab" />
        </div>
        <template #footer>
            <p-divider />
            <p-button style-type="negative-secondary"
                      size="md"
                      icon-left="ic_delete"
                      class="delete-button"
                      @click="() => { state.isOverlayOpenProxy = false; }"
            >
                {{ $t('LADING.DELETE_WORKSPACE_GROUP') }}
            </p-button>
        </template>
    </p-overlay-layout>
</template>

<style scoped lang="postcss">
.contents-wrapper {
    margin: 0 1.5rem;
    width: 100%;

    .name-field-contents {
        @apply flex items-center gap-2;

        .name-input {
            width: 26rem;
        }
    }
}

.delete-button {
    margin: 0.75rem 0 0.75rem 1.5rem;
}
</style>
