<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PFieldTitle, PCheckboxGroup, PCheckbox, PLazyImg,
} from '@spaceone/design-system';

import { store } from '@/store';

const emit = defineEmits<{(e:'select-label', labels: string[]):void;
}>();


const state = reactive({
    providers: computed(() => store.getters['reference/providerItems']),
    providerList: computed(() => [
        ...Object.keys(state.providers).map((k) => ({
            label: state.providers[k].name,
            name: state.providers[k].name,
            img: state.providers[k]?.icon,
        })),
        { name: 'etc', label: 'ETC', img: undefined },
    ]),
    selectedProvider: 'all',
    services: computed(() => ['Cost', 'Asset', 'Compliance', 'Security']),
    serviceList: computed(() => state.services.map((service) => ({
        label: service,
        name: service,
        icon: null,
        color: null,
    }))),
    selectedLabels: [],
});

const handleChangeLabelFilter = (selected: string[]) => {
    state.selectedLabels = selected;
    emit('select-label', state.selectedLabels);
};

</script>
<template>
    <div class="dashboard-create-step-1-search-filter">
        <div class="radio-container">
            <div class="label">
                <p-field-title class="title">
                    Provider
                </p-field-title>
                <p-checkbox-group direction="vertical">
                    <p-checkbox v-for="provider in state.providerList"
                                :key="provider.name"
                                class="label-item"
                                :selected="state.selectedLabels"
                                :value="provider.name"
                                @change="handleChangeLabelFilter"
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
                    </p-checkbox>
                </p-checkbox-group>
            </div>
            <div class="label">
                <p-field-title class="title">
                    Serivce
                </p-field-title>
                <p-checkbox-group direction="vertical">
                    <p-checkbox v-for="service in state.serviceList"
                                :key="service.name"
                                class="label-item"
                                :selected="state.selectedLabels"
                                :value="service.name"
                                @change="handleChangeLabelFilter"
                    >
                        <div class="content-menu-item">
                            {{ service.label }}
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
        margin-bottom: 1.625rem;

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
