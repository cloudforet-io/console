<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PFieldTitle, PCheckboxGroup, PCheckbox, PLazyImg, PSelectDropdown,
} from '@spaceone/design-system';

import { store } from '@/store';

export interface TemplateLabelItem {
    label: string;
    name: string;
    img?: string;
}

const emit = defineEmits<{(e:'select-label', labels: TemplateLabelItem[]):void;
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
    services: computed(() => ['Cost', 'Asset', 'Compliance', 'Security']),
    serviceList: computed(() => state.services.map((service) => ({
        label: service,
        name: service,
        icon: null,
        color: null,
    }))),
    selectedProviders: [],
    selectedServices: [],
});

const handleChangeLabelFilter = (type: 'Provider'|'Service', selected: TemplateLabelItem[]) => {
    if (type === 'Provider') state.selectedProviders = selected;
    if (type === 'Service') state.selectedServices = selected;
    const mergedSelected = [...state.selectedProviders, ...state.selectedServices];
    emit('select-label', mergedSelected);
};

</script>
<template>
    <div class="dashboard-create-step-1-search-filter">
        <div class="label-container">
            <div class="label">
                <p-field-title class="title">
                    Provider
                </p-field-title>
                <p-checkbox-group direction="vertical">
                    <p-checkbox v-for="provider in state.providerList"
                                :key="provider.name"
                                class="label-item"
                                :selected="state.selectedProviders"
                                :value="provider"
                                @change="handleChangeLabelFilter('Provider', $event)"
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
                                :selected="state.selectedServices"
                                :value="service"
                                @change="handleChangeLabelFilter('Service', $event)"
                    >
                        <div class="content-menu-item">
                            {{ service.label }}
                        </div>
                    </p-checkbox>
                </p-checkbox-group>
            </div>
        </div>
        <div class="dropdown-container">
            <p-select-dropdown multi-selectable
                               style-type="rounded"
                               appearance-type="badge"
                               selection-label="Provider"
                               :show-delete-all-button="false"
                               :menu="state.providerList"
                               :selected="state.selectedProviders"
                               @update:selected="handleChangeLabelFilter('Provider', $event)"
            />
            <p-select-dropdown multi-selectable
                               style-type="rounded"
                               appearance-type="badge"
                               selection-label="Service"
                               :show-delete-all-button="false"
                               :menu="state.serviceList"
                               :selected="state.selectedServices"
                               @update:selected="handleChangeLabelFilter('Service', $event)"
            />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-create-step-1-search-filter {

    .label-container {
        width: 14.125rem;
        height: calc(100vh - 17rem);
        overflow-y: auto;
        .label {
            @apply flex flex-col;
            gap: 0.75rem;
            margin-bottom: 1.625rem;
            .label-item {
                margin-bottom: 0.5rem;
                .content-menu-item {
                    @apply inline-flex items-center text-label-md;
                    margin-left: 0.25rem;
                }
            }
        }
    }

    .dropdown-container {
        @apply w-full flex gap-2;
        display: none;
    }

    @screen tablet {
        .label-container {
            display: none;
        }
        .dropdown-container {
            display: flex;
        }
    }
}

</style>
