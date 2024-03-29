<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PDataLoader, PEmpty, PButton } from '@spaceone/design-system';

import type { WorkspaceModel } from '@/schema/identity/workspace/model';
import { store } from '@/store';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

const userWorkspaceStore = useUserWorkspaceStore();
const workspaceStoreState = userWorkspaceStore.$state;

const storeState = reactive({
    isDomainAdmin: computed(() => store.getters['user/isDomainAdmin']),
    workspaceList: computed<WorkspaceModel[]>(() => [...workspaceStoreState.getters.workspaceList]),
});
const state = reactive({
    loading: false,
});

const handleCreateWorkspace = () => {

};
</script>

<template>
    <div class="landing-contents">
        <div class="title-wrapper">
            <strong class="title">{{ $t('LADING.TITLE') }}</strong>
            <div class="desc">
                <div v-if="storeState.isDomainAdmin">
                    <p>{{ $t('LADING.DESC_ACCESSIBLE_WORKSPACE_ADMIN', { cnt: storeState.workspaceList.length }) }}</p>
                    <p>{{ $t('LADING.DESC_CLICK_OR_CREATE') }}</p>
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
                <p-empty
                    show-image
                    show-button
                    class="no-data-wrapper"
                >
                    <template #image>
                        <img alt="illust_astronaut_radio"
                             src="@/assets/images/illust_astronaut_radio.svg"
                        >
                    </template>
                    <template #button>
                        <p-button v-if="storeState.isDomainAdmin"
                                  style-type="primary"
                                  size="md"
                                  icon-left="ic_plus_bold"
                                  class="btn-create"
                                  @click="handleCreateWorkspace"
                        >
                            {{ $t('LADING.CREATE_WORKSPACE') }}
                        </p-button>
                    </template>
                    <div class="not-found">
                        <p>{{ $t('LADING.NOT_FOUND') }}</p>
                        <div class="not-found-desc">
                            <p>{{ $t('LADING.NOT_FOUND_DESC') }}</p>
                            <p v-if="storeState.isDomainAdmin">
                                {{ $t('LADING.DESC_CREATE_WORKSPACE') }}
                            </p>
                        </div>
                    </div>
                </p-empty>
            </template>
        </p-data-loader>
    </div>
</template>

<style scoped lang="postcss">
.landing-contents {
    @apply flex flex-col;
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
    .no-data-wrapper {
        padding-top: 1.5rem;
        .not-found {
            @apply flex flex-col text-label-lg text-gray-400;
            .not-found-desc {
                @apply text-label-md text-violet-300;
                margin-top: 0.5rem;
            }
        }
        .btn-create {
            margin-top: 1rem;
        }
    }
}
</style>
