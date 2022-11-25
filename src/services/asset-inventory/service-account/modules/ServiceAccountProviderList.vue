<template>
    <div class="service-account-provider-list"
         :class="{'low-count-provider-list': providerList.length < 6}"
    >
        <button v-for="item in providerList"
                :key="item.key"
                :class="{'provider-button': true, 'selected-button' : item.key === selectedProvider}"
                @click="() => handleSelectProvider(item.key)"
        >
            <p-lazy-img :src="item.icon"
                        width="1rem"
                        height="1rem"
            />
            <p :class="{'provider-name': true, 'selected': item.key === selectedProvider }">
                {{ item.name }}
            </p>
        </button>
    </div>
</template>

<script lang="ts">

import type { SetupContext } from 'vue';
import { defineComponent, reactive, toRefs } from 'vue';

import { PLazyImg } from '@spaceone/design-system';

import { useProxyValue } from '@/common/composables/proxy-state';

export default defineComponent({
    name: 'ServiceAccountProviderList',
    components: {
        PLazyImg,
    },
    props: {
        providerList: {
            type: Array,
            default: () => [],
        },
        selectedProvider: {
            type: String,
            default: 'atlassian',
        },
    },
    setup(props, { emit }: SetupContext) {
        const state = reactive({
            proxySelectedProvider: useProxyValue('selectedProvider', props, emit),
        });
        const handleSelectProvider = (providerName) => {
            state.proxySelectedProvider = providerName;
        };
        return {
            ...toRefs(state),
            handleSelectProvider,
        };
    },
});

</script>

<style lang="postcss" scoped>
.service-account-provider-list {
    @apply grid w-full gap-2;
    grid-template-columns: repeat(6, minmax(10rem, auto));
    padding-bottom: 1rem;
    overflow-x: auto;
    .provider-button {
        @apply flex items-center border rounded-lg border-gray-200 bg-white;
        min-width: 10rem;
        padding: 0.75rem 1rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);

        .provider-name {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            max-width: calc(100% - 1rem);
            font-size: 0.875rem;
            line-height: 1.25;
            padding-left: 0.375rem;
            word-wrap: break-word;
            text-overflow: ellipsis;
            overflow: hidden;
        }
    }
    .selected-button {
        @apply border-blue-600;
        .selected {
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
