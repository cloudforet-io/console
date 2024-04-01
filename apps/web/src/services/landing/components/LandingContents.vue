<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PDataLoader } from '@spaceone/design-system';

import type { WorkspaceModel } from '@/schema/identity/workspace/model';
import { store } from '@/store';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import LandingEmptyContents from '@/services/landing/components/LandingEmptyContents.vue';

const userWorkspaceStore = useUserWorkspaceStore();
const workspaceStoreState = userWorkspaceStore.$state;

const storeState = reactive({
    isDomainAdmin: computed(() => store.getters['user/isDomainAdmin']),
    workspaceList: computed<WorkspaceModel[]>(() => [...workspaceStoreState.getters.workspaceList]),
});
const state = reactive({
    loading: false,
});
</script>

<template>
    <div class="landing-contents">
        <div class="title-wrapper">
            <strong class="title">{{ $t('LADING.TITLE') }}</strong>
            <div class="desc">
                <div v-if="storeState.isDomainAdmin">
                    <p>{{ $t('LADING.DESC_ACCESSIBLE_WORKSPACE_ADMIN', { cnt: storeState.workspaceList.length }) }}</p>
                    <p v-if="storeState.workspaceList.length > 0">
                        {{ $t('LADING.DESC_CLICK_OR_CREATE') }}
                    </p>
                </div>
                <p v-else
                   class="desc"
                >
                    {{ $t('LADING.DESC_ACCESSIBLE_WORKSPACE', { cnt: storeState.workspaceList.length }) }}
                    <span v-if="storeState.workspaceList.length > 0"> {{ $t('LADING.DESC_CLICK') }}</span>
                </p>
            </div>
        </div>
        <p-data-loader :loading="state.loading"
                       :data="[]"
        >
            <template #no-data>
                <landing-empty-contents :is-domain-admin="storeState.isDomainAdmin" />
            </template>
        </p-data-loader>
    </div>
</template>

<style scoped lang="postcss">
.landing-contents {
    @apply flex flex-col;
    max-width: 44.5rem;
    padding-top: 5rem;
    gap: 2rem;
    .title-wrapper {
        @apply flex flex-col items-center;
        gap: 0.5rem;
        .title {
            @apply text-display-md text-gray-800;
        }
        .desc {
            @apply text-label-md text-gray-700 text-center;
        }
    }
}
</style>
