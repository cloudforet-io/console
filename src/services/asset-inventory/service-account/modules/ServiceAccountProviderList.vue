<template>
    <div class="service-account-provider-list">
        <div v-for="item in providerList" :key="item.provider" :class="{'provider-button': true, 'selected-button' : item.provider === selectedProvider}"
             @click="() => handleSelectProvider(item.provider)"
        >
            <p-lazy-img :src="item.icon"
                        width="1rem" height="1rem"
            />
            <p :class="{'provider-name': true, 'selected': item.provider === selectedProvider }">
                {{ item.name }}
            </p>
        </div>
    </div>
</template>

<script lang="ts">

import { reactive, toRefs } from '@vue/composition-api';

import { PLazyImg } from '@spaceone/design-system';

import { useProxyValue } from '@/common/composables/proxy-state';

export default {
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
            default: 'aws',
        },
    },
    setup(props, { emit }) {
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
};


</script>

<style lang="postcss" scoped>
.service-account-provider-list {
    @apply grid w-full gap-2;
    grid-template-columns: repeat(6, minmax(10rem, auto));
    margin-bottom: 1rem;
    overflow-x: scroll;
    .provider-button {
        @apply flex items-center border rounded-lg border-gray-200 bg-white;
        min-width: 10rem;
        padding: 0.75rem 1rem;
        .provider-name {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            width: calc(100% - 1rem);
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

</style>
