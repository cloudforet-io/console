<script lang="ts" setup>
import { computed, reactive } from 'vue';

import {
    PI, PBoard, PFieldTitle, PLazyImg,
} from '@spaceone/design-system';

import { ROLE_TYPE } from '@/schema/identity/role/constant';
import { store } from '@/store';

import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';

import DashboardCreateScopeForm from '@/services/dashboards/components/DashboardCreateScopeForm.vue';


interface ProviderBoardSet {
    value: string;
    title: string;
}
const storeState = reactive({
    isWorkspaceOwner: computed(() => store.getters['user/getCurrentRoleInfo']?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
    providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
});
const state = reactive({
    // TODO: temp data
    providerBoardSets: computed<ProviderBoardSet[]>(() => ([
        {
            value: 'aws',
            title: storeState.providers.aws?.label ?? 'AWS',
        },
        {
            value: 'google_cloud',
            title: storeState.providers.google_cloud?.label ?? 'Google Cloud',
        },
        {
            value: 'azure',
            title: storeState.providers.azure?.label ?? 'Azure',
        },
    ])),
    selectedProviderId: undefined as undefined|string,
});


/* Event */
const handleClickProviderItem = (item: ProviderBoardSet) => {
    state.selectedProviderId = item.value;
};
</script>

<template>
    <div class="dashboard-create-step2">
        <div class="selected-ootb-wrapper">
            <p-i name="ic_dashboard-template_blank"
                 width="3.5rem"
                 height="3.5rem"
            />
            <div class="description-wrapper">
                <p class="description-title">
                    {{ $t('DASHBOARDS.CREATE.BLANK') }}
                </p>
                <p class="description-text">
                    {{ $t('DASHBOARDS.CREATE.BLANK_DESC') }}
                </p>
            </div>
        </div>
        <div class="provider-board-wrapper">
            <p-field-title class="field-title">
                <!--TODO: set language after spec is ready-->
                Provider
            </p-field-title>
            <p-board style-type="cards"
                     :style-options="{ column: 2 }"
                     :board-sets="state.providerBoardSets"
                     selectable
                     :selected-item="state.selectedProviderId"
                     @item-click="handleClickProviderItem"
            >
                <template #item-left-content="{board}">
                    <p-lazy-img width="2.5rem"
                                height="2.5rem"
                                :src="storeState.providers[board.value]?.icon"
                                class="mr-3"
                    />
                </template>
                <template #item-content="{board}">
                    {{ board.title }}
                </template>
            </p-board>
        </div>
        <dashboard-create-scope-form />
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-create-step2 {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}
.field-title {
    padding-bottom: 0.75rem;
}
.selected-ootb-wrapper {
    display: flex;
    gap: 1rem;
    .description-wrapper {
        display: grid;
        align-items: center;
        padding: 0.25rem 0;
        .description-title {
            @apply text-label-lg;
            font-weight: 500;
        }
        .description-text {
            @apply text-label-md text-gray-500;
            font-weight: 400;
        }
    }
}
</style>
