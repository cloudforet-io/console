<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { screens, PTextButton } from '@cloudforet/mirinae';

import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import { LANDING_ROUTE } from '@/services/landing/routes/route-constant';

const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceGetters = userWorkspaceStore.getters;
const router = useRouter();

const { width } = useWindowSize();

const storeState = reactive({
    workspaceList: computed<WorkspaceModel[]>(() => userWorkspaceGetters.workspaceList),
});
const state = reactive({
    isTabletSize: computed(() => width.value < screens.tablet.max),
    isMobileSize: computed(() => width.value < screens.mobile.max),
});
</script>

<template>
    <div class="domain-landing-start-banner">
        <div class="text-section section">
            <p class="title">
                {{ $t('LADING.DOMAIN.GET_STARTED_TITLE') }}
            </p>
            <span v-if="!state.isTabletSize"
                  class="desc"
            >{{ $t('LADING.DOMAIN.GET_STARTED_DESC') }}</span>
            <div class="buttons-wrapper">
                <p-text-button v-if="storeState.workspaceList.length > 0"
                               icon-left="ic_rocket-filled"
                               style-type="highlight"
                               class="workspace-button"
                               @click="router.push({ name: LANDING_ROUTE.WORKSPACE._NAME })"
                >
                    {{ $t('LADING.DOMAIN.EXPLORE_WORKSPACE_TITLE') }}
                </p-text-button>
            </div>
        </div>
        <div v-if="!state.isMobileSize"
             class="image-wrapper"
        >
            <img alt="get-started-illustration"
                 src="/images/domain-landing/domain-landing_admin_hero-image.png"
                 srcset="/images/domain-landing/domain-landing_admin_hero-image@2x.png 2x,
                        /images/domain-landing/domain-landing_admin_hero-image@3x.png 3x"
                 class="get-started-illustration"
            >
        </div>
    </div>
</template>

<style scoped lang="postcss">
.domain-landing-start-banner {
    @apply flex bg-violet-150 border border-violet-200;
    height: 19.5rem;
    padding: 2.5rem 2rem;
    border-radius: 0.375rem;
    .section {
        flex: 1;
    }
    .text-section {
        @apply flex flex-col;
        gap: 1rem;
        .title {
            @apply text-display-sm text-violet-900;
            max-width: 29.5rem;
        }
        .desc {
            @apply block text-paragraph-lg text-gray-700;
            max-width: 40rem;
            flex: 1;
        }
        .buttons-wrapper {
            @apply flex flex-col;
            gap: 1.5rem;
            .workspace-button {
                @apply block text-left;
                padding: 0;
            }
        }
    }
    .image-wrapper {
        @apply flex justify-center items-end;
        flex: 1;
        .get-started-illustration {
            width: 28rem;
            height: 26.5rem;
            margin-bottom: -4.5rem;
        }
    }

    @screen laptop {
        height: 21rem;
    }

    @screen tablet {
        height: 19.25rem;
        .text-section {
            .title {
                flex: 1;
            }
        }
    }

    @screen mobile {
        height: 14rem;
        .text-section {
            .title {
                flex: 1;
            }
        }
    }

    @media (max-width: 478px) {
        height: 21rem;
    }
}
</style>
