<template>
    <div class="provider-list"
         :class="{'low-count-provider-list': providerList?.length < 6}"
    >
        <p-button v-for="item in providerList"
                  :key="item.key"
                  :class="{'selected-button' : item.key === selectedProvider}"
                  style-type="tertiary"
                  @click="handleSelectProvider(item.key)"
        >
            <p-lazy-img v-if="item.icon"
                        :src="item.icon"
                        width="1rem"
                        height="1rem"
            />
            <p class="provider-name">
                {{ item.name }}
            </p>
        </p-button>
    </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

import { PLazyImg, PButton } from '@spaceone/design-system';

import type { ReferenceItem } from '@/store/modules/reference/type';

import { useProxyValue } from '@/common/composables/proxy-state';

interface Props {
    providerList?: ReferenceItem[];
    selectedProvider: string;
}

const props = withDefaults(defineProps<Props>(), {
    providerList: undefined,
    selectedProvider: 'all',
});

const emit = defineEmits<{(e: 'change-provider', providerName: string): void}>();

const state = reactive({
    proxySelectedProvider: useProxyValue('selectedProvider', props, emit),
});
const handleSelectProvider = (providerName) => {
    state.proxySelectedProvider = providerName;
    emit('change-provider', providerName);
};
</script>

<style lang="postcss" scoped>
.provider-list {
    @apply grid w-full gap-2;
    grid-template-columns: repeat(6, minmax(10rem, auto));
    overflow-x: auto;

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
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            max-width: calc(100% - 1rem);
            padding-left: 0.375rem;
            word-wrap: break-word;
            text-overflow: ellipsis;
            overflow: hidden;
        }
    }
    .selected-button {
        @apply border-blue-600;
        box-shadow: initial;
        .provider-name {
            @apply text-blue-600;
        }
    }
}

.low-count-provider-list {
    @apply flex;
    grid-template-columns: unset;
    .provider-button {
        flex-grow: 1;
        max-width: 18.75rem;
    }
}

</style>
