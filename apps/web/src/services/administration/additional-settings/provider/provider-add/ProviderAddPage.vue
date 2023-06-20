<template>
    <section class="provider-add-page">
        <!--TODO: translation-->
        <p-heading
            show-back-button
            :title="$t('Add Provider')"
            @click-back-button="$router.go(-1)"
        />
        <p-divider />
        <p-data-loader class="flex-grow"
                       :data="providerList"
                       :loading="loading"
        >
            <div class="provider-item-wrapper">
                <!--                <provider-list-card v-for="item in providerList"-->
                <!--                                    :key="item.name"-->
                <!--                                    :provider-item="item"-->
                <!--                                    :visible.sync="visibleInstallModal"-->
                <!--                                    :selected-provider.sync="selectedProvider"-->
                <!--                                    @select="handleSelectProvider"-->
                <!--                />-->
            </div>
        </p-data-loader>
        <!--TODO: translation-->
        <p-button-modal
            :header-title="$t('Would you like to install', {provider: selectedProvider})"
            :visible.sync="visibleInstallModal"
            size="sm"
            @confirm="handleConfirmInstallProvider"
        />
        <!--TODO: translation-->
        <p-icon-modal
            :visible.sync="visibleResultModal"
            icon-name="ic_check-circle"
            :header-title="$t('has been successfully added.', {provider: selectedProvider})"
            :button-text="$t('Done')"
            size="md"
        />
    </section>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from 'vue';

import {
    PHeading, PDivider, PDataLoader, PButtonModal, PIconModal,
} from '@spaceone/design-system';

import { store } from '@/store';

import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';


export default {
    name: 'ProviderAddPage',
    components: {
        PHeading,
        PDivider,
        PDataLoader,
        PButtonModal,
        PIconModal,
    },
    setup() {
        const state = reactive({
            providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
            providerList: computed(() => Object.keys(state.providers).map((k) => ({
                name: k,
                icon: state.providers[k].icon,
                label: k,
                color: state.providers[k].color,
                installed: false,
            }))),
            selectedProvider: '',
            loading: false,
            visibleInstallModal: false,
            visibleResultModal: false,
        });

        const handleConfirmInstallProvider = () => {
            state.visibleInstallModal = false;
            state.visibleResultModal = true;
        };

        const handleSelectProvider = (value) => {
            state.selectedProvider = value;
        };

        const init = async () => {
            await Promise.allSettled([
                store.dispatch('reference/provider/load'),
            ]);
        };
        init();

        return {
            ...toRefs(state),
            handleConfirmInstallProvider,
            handleSelectProvider,
        };
    },
};
</script>

<style lang="postcss" scoped>
.provider-item-wrapper {
    @apply grid w-full gap-4 ;
    padding-top: 1.5rem;
    grid-template-columns: repeat(2, minmax(22rem, 1fr));

    @screen mobile {
        grid-template-columns: repeat(auto-fill, minmax(22rem, 1fr));
    }
}
</style>
