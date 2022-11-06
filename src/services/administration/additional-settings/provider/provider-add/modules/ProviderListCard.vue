<template>
    <p-card-item class="provider-list-card"
                 @click="handleInstallModalOpen"
    >
        <template #side>
            <p-lazy-img :src="providerItem.icon"
                        error-icon="ic_collector_tags"
                        width="4rem"
                        height="4rem"
            />
        </template>
        <template #body>
            <div class="provider-card-body-contents">
                <div class="card-header-contents">
                    <header class="title">
                        {{ providerItem.name }}
                    </header>
                    <span v-if="providerItem.installed"
                          class="contents"
                    >{{ $t('Already installed') }}</span>
                </div>
                <div class="card-button">
                    <!--song-lang-->
                    <p-button style-type="primary"
                              :disabled="providerItem.installed"
                    >
                        Install
                    </p-button>
                </div>
            </div>
        </template>
    </p-card-item>
</template>

<script lang="ts">

import { reactive, toRefs } from 'vue';

import { PCardItem, PButton, PLazyImg } from '@spaceone/design-system';

import { useProxyValue } from '@/common/composables/proxy-state';

export default {
    name: 'ProviderListCard',
    components: {
        PCardItem,
        PButton,
        PLazyImg,
    },
    props: {
        providerItem: {
            type: Object,
            default: null,
        },
        visible: {
            type: Boolean,
            default: false,
        },
        selectedProvider: {
            type: String,
            default: '',
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            proxyVisible: useProxyValue('visible', props, emit),
            proxySelectedProvider: props.selectedProvider,
        });

        const handleInstallModalOpen = () => {
            state.proxySelectedProvider = props.providerItem.name;
            state.proxyVisible = true;
            emit('select', state.proxySelectedProvider);
        };

        return {
            ...toRefs(state),
            handleInstallModalOpen,
        };
    },
};
</script>

<style lang="postcss" scoped>
.provider-list-card {
    height: 6rem;
}
.provider-card-body-contents {
    @apply flex;
    height: 100%;
}
.card-header-contents {
    @apply flex-grow;
    line-height: 1.125rem;
    .title {
        font-size: 1rem;
        font-weight: bold;
        padding-bottom: 0.25rem;
    }
    .contents {
        font-size: 0.875rem;
    }
}
.card-button {
    @apply flex flex-grow-0 items-end;
}
</style>
