<template>
    <div class="collector-provider-list">
        <p-button v-for="item in state.providerList"
                  :key="item.key"
                  :class="{'provider-button': true, 'selected-button': item.key === state.selectedProvider}"
                  style-type="tertiary"
                  @click="() => handleSelectProvider(item.key)"
        >
            <p-lazy-img v-if="item.icon"
                        :src="item.icon"
                        width="1rem"
                        height="1rem"
            />
            <p class="provider-name">
                {{ item.label }}
            </p>
        </p-button>
    </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { PLazyImg, PButton } from '@spaceone/design-system';

import { store } from '@/store';

import type { ReferenceItem } from '@/store/modules/reference/type';

import { useCollectorPageStore } from '@/services/asset-inventory/store/collector-page-store';

const cloudCollectorPageStore = useCollectorPageStore();
const cloudCollectorPageState = cloudCollectorPageStore.$state;

const state = reactive({
    providerList: [] as ReferenceItem[],
    selectedProvider: computed(() => cloudCollectorPageState.selectedProvider),
});

const handleSelectProvider = (providerName) => {
    cloudCollectorPageStore.setSelectedProvider(providerName);
};

/* Watcher */
watch(() => store.state.reference.provider.items, (value: ReferenceItem) => {
    state.providerList = [
        { key: 'all', label: 'All Providers' },
        ...Object.values(value),
    ];
}, { immediate: true });
</script>

<style scoped lang="postcss">
.collector-provider-list {
    @apply flex overflow-x-auto;
    gap: 0.625rem;
    max-width: 100%;
    &::-webkit-scrollbar {
        @apply hidden;
    }

    /* custom design-system component - p-button */
    :deep(.p-button) {
        @apply justify-start bg-white rounded-lg border-gray-200;
        min-width: 11.375rem;
        height: 2.625rem;
        padding: 0.75rem 0.875rem;
        gap: 0.375rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);

        &:hover {
            background-color: transparent;
        }

        .provider-name {
            @apply text-gray-900 font-normal;
        }

        &.selected-button {
            @apply border-blue-600;
            box-shadow: initial;
            .provider-name {
                @apply text-blue-600;
            }
        }
    }
}

</style>
