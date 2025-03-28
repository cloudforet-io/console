
<script setup lang="ts">
import { computed, reactive } from 'vue';


import {
    PFieldGroup, POverlayLayout, PTextInput, PButton, PDivider,
} from '@cloudforet/mirinae';

import type { WorkspaceGroupModel } from '@/api-clients/identity/workspace-group/schema/model';

import { useUserWorkspaceGroupStore } from '@/store/app-context/workspace/user-workspace-group-store';

import { useProxyValue } from '@/common/composables/proxy-state';

import LandingWorkspaceGroupTab from '@/services/landing/components/workspace-landing/landing-group-workspaces/LandingWorkspaceGroupTab.vue';
import { useLandingPageStore } from '@/services/landing/store/landing-page-store';

interface Props {
    isOverlayOpen: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    isOverlayOpen: false,
});
const emit = defineEmits<{(e: 'update:is-overlay-open'): void}>();

const userWorkspaceGroupStore = useUserWorkspaceGroupStore();
const userWorkspaceGroupStoreGetters = userWorkspaceGroupStore.getters;
const landingPageStore = useLandingPageStore();
const landingPageStoreState = landingPageStore.state;

const state = reactive({
    isOverlayOpenProxy: useProxyValue('isOverlayOpen', props, emit),
    workspaceGroup: computed<WorkspaceGroupModel|undefined>(() => userWorkspaceGroupStoreGetters.workspaceGroupMap[landingPageStoreState.selectedWorkspaceGroup]),
});

const handleClose = () => {
    state.isOverlayOpenProxy = false;
    landingPageStore.resetGroupUserTableState();
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
                    <p-text-input :value="state.workspaceGroup?.name ?? ''"
                                  :disabled="true"
                                  required
                                  class="name-input"
                    />
                </div>
            </p-field-group>
            <landing-workspace-group-tab class="workspace-group-tab" />
        </div>
        <template #footer>
            <p-divider />
            <div class="close-button-wrapper">
                <p-button style-type="substitutive"
                          size="md"
                          @click="handleClose"
                >
                    {{ $t('LADING.DONE') }}
                </p-button>
            </div>
        </template>
    </p-overlay-layout>
</template>

<style scoped lang="postcss">
.contents-wrapper {
    margin: 0 1.5rem;
    width: 100%;

    .name-field-contents {
        .name-input {
            width: 26rem;
        }
    }
}

.close-button-wrapper {
    margin: 0.75rem 1.5rem 0.75rem 0;
    float: right;
}
</style>
