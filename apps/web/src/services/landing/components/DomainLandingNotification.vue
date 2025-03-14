<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PI, PLink } from '@cloudforet/mirinae';

import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';
import { i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import { violet } from '@/styles/colors';

import { LANDING_ROUTE } from '@/services/landing/routes/route-constant';

const userWorkspaceStore = useUserWorkspaceStore();
const workspaceStoreGetters = userWorkspaceStore.getters;

const storeState = reactive({
    workspaceList: computed<WorkspaceModel[]>(() => workspaceStoreGetters.workspaceList),
});

const state = reactive({
    isWarning: computed<boolean>(() => storeState.workspaceList.length === 0),
});
</script>

<template>
    <div class="domain-landing-notification"
         :class="{ 'is-warning': state.isWarning }"
    >
        <p-i v-if="state.isWarning"
             name="ic_warning-filled"
             class="item-type-icon"
             width="1.25rem"
             height="1.25rem"
        />
        <p-i v-else
             name="ic_roket"
             class="item-type-icon"
             width="1.25rem"
             height="1.25rem"
             :color="violet[600]"
        />
        <p class="text">
            <strong class="title">
                {{ state.isWarning ? $t('LADING.NOT_FOUND_ACCESS_WORKSPACE') : $t('LADING.DOMAIN.EXPLORE_WORKSPACE_TITLE') }}
            </strong>
            <span class="desc">
                {{ state.isWarning ? $t('LADING.DOMAIN.ALT_W_DESC') : $t('LADING.DOMAIN.EXPLORE_WORKSPACE_DESC') }}
                <p-link v-if="!state.isWarning"
                        :text="i18n.t('LADING.DOMAIN.GO_TO_EXPLORE')"
                        :to="{name: LANDING_ROUTE.WORKSPACE._NAME}"
                        size="md"
                        highlight
                        action-icon="internal-link"
                />
            </span>
        </p>
    </div>
</template>

<style scoped>
.domain-landing-notification {
    @apply flex items-start bg-violet-200;
    max-width: 54.625rem;
    margin-bottom: 1rem;
    padding: 0.5rem 1rem;
    gap: 0.25rem;
    border-radius: 0.25rem;
    &.is-warning {
        @apply bg-yellow-100;
        .text {
            .title {
                @apply text-yellow-700;
            }
        }
    }
    .text {
        @apply text-paragraph-md;
        .title {
            @apply text-label-lg text-violet-700;
        }
        .desc {
            @apply block;
        }
    }
}
</style>
