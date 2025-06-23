<script setup lang="ts">
import { useElementSize } from '@vueuse/core';
import { computed, reactive, ref } from 'vue';

import { cloneDeep } from 'lodash';

import { PLazyImg, PButton } from '@cloudforet/mirinae';

import type { ProviderModel } from '@/api-clients/identity/provider/schema/model';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import BetaMark from '@/common/components/marks/BetaMark.vue';
import { useProxyValue } from '@/common/composables/proxy-state';

const PROVIDER_BUTTON_SIZE = 182;
const GAP_SIZE = 8;
const containerRef = ref<HTMLElement|null>(null);
type ProviderItem = {
    key: string;
    name: string;
    icon?: string;
};
const { width } = useElementSize(containerRef);

interface Props {
    providerList?: Pick<ProviderModel, 'provider'|'name'|'icon'>[];
    selectedProvider?: string;
}

const props = withDefaults(defineProps<Props>(), {
    providerList: () => [],
    selectedProvider: undefined,
});

const emit = defineEmits<{(e: 'update:selected-provider', value: string): void}>();

const state = reactive({
    proxySelectedProvider: useProxyValue('selectedProvider', props, emit),
    // states for design
    providerCount: computed<number>(() => props.providerList?.length || 0),
    refinedProviderList: computed<ProviderItem[][]>(() => {
        const originProviderList = cloneDeep(props.providerList || []).map<ProviderItem>((item) => ({
            key: item.provider,
            name: item.name,
            icon: assetUrlConverter(item.icon),
        }));
        if (state.providerCount * (PROVIDER_BUTTON_SIZE + GAP_SIZE) < width.value) {
            return [originProviderList];
        } if (state.providerCount * (PROVIDER_BUTTON_SIZE + GAP_SIZE) < width.value * 2) {
            const firstRowCount = Math.floor(width.value / (PROVIDER_BUTTON_SIZE + GAP_SIZE));
            return [originProviderList.slice(0, firstRowCount), originProviderList.slice(firstRowCount)];
        }
        const halfCount = Math.ceil(state.providerCount / 2);
        return [originProviderList.slice(0, halfCount), originProviderList.slice(halfCount)];
    }),
});
const handleSelectProvider = (providerName: string) => {
    state.proxySelectedProvider = providerName;
};
</script>

<template>
    <div ref="containerRef"
         class="provider-button-list"
    >
        <div v-for="(row, index) in state.refinedProviderList"
             :key="`provider-list-${index}`"
             class="provider-list"
        >
            <p-button v-for="item in row"
                      :key="item.key"
                      class="provider-button"
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
                <beta-mark v-if="item.key === 'kubernetes'"
                           class="beta"
                />
            </p-button>
        </div>
    </div>
</template>


<style lang="postcss" scoped>
.provider-button-list {
    @apply flex flex-col gap-2;
    overflow-x: auto;
    .provider-list {
        @apply flex w-full gap-2;

        .provider-button {
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

            .beta {
                @apply font-normal;
                margin-left: 0;
                margin-top: -0.375rem;
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
}

</style>
