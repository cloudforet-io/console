<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PFieldTitle, PRadioGroup, PCheckboxGroup, PCheckbox, PRadio, PLazyImg,
} from '@spaceone/design-system';

import { store } from '@/store';

const state = reactive({
    providers: computed(() => store.getters['reference/providerItems']),
    providerList: computed(() => [
        { name: 'all', label: 'All Providers', img: undefined },
        ...Object.keys(state.providers).map((k) => ({
            label: state.providers[k].name,
            name: k,
            img: state.providers[k]?.icon,
        })),
        { name: 'etc', label: 'ETC', img: undefined },
    ]),
    selectedProvider: 'all',
    labels: computed(() => ['Cost', 'Asset', 'Compliance', 'Security']),
    labelList: computed(() => state.labels.map((label) => ({
        label,
        name: label,
        icon: null,
        color: null,
    }))),
    selectedLabels: [],
});

const handleChangeProvider = (provider: string) => {
    state.selectedProvider = provider;
};
const handleChangeLabel = (label: string) => {
    state.selectedLabels = [...state.selectedLabels, label];
};

</script>
<template>
    <div class="dashboard-create-step-1-search-filter">
        <div class="radio-container">
            <div class="provider">
                <p-field-title class="title">
                    Provider
                </p-field-title>
                <p-radio-group direction="vertical">
                    <p-radio v-for="provider in state.providerList"
                             :key="provider.name"
                             class="provider-item"
                             :selected="state.selectedProvider"
                             :value="provider.name"
                             @change="handleChangeProvider"
                    >
                        <div class="content-menu-item">
                            <p-lazy-img v-if="provider.name !== 'all'"
                                        width="1.25rem"
                                        height="1.25rem"
                                        error-icon="ic_cloud-filled"
                                        :src="provider.img"
                                        class="mr-1"
                            />{{ provider.label }}
                        </div>
                    </p-radio>
                </p-radio-group>
            </div>
            <div class="label">
                <p-field-title class="title">
                    Label
                </p-field-title>
                <p-checkbox-group direction="vertical">
                    <p-checkbox v-for="label in state.labelList"
                                :key="label.name"
                                class="label-item"
                                :selected="state.selectedLabels.includes(label.name)"
                                :value="label.name"
                                @change="handleChangeLabel"
                    >
                        <div class="content-menu-item">
                            {{ label.label }}
                        </div>
                    </p-checkbox>
                </p-checkbox-group>
            </div>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-create-step-1-search-filter {
    width: 14.125rem;
    .content-menu-item {
        @apply inline-flex items-center text-label-md;
        margin-left: 0.25rem;
    }

    .provider {
        @apply flex flex-col;
        gap: 0.75rem;
        margin-bottom: 1.625rem;

        .provider-item {
            margin-bottom: 0.5rem;
        }
    }

    .label {
        @apply flex flex-col;
        gap: 0.75rem;
        .label-item {
            margin-bottom: 0.5rem;
        }
    }
    .radio-container {
        height: calc(100vh - 17rem);
        overflow-y: auto;
    }
}

</style>
