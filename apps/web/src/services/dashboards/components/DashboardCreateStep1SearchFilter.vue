<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PFieldTitle, PCheckboxGroup, PCheckbox, PLazyImg, PSelectDropdown,
} from '@spaceone/design-system';

import { store } from '@/store';

import type { PluginReferenceMap, PluginReferenceItem } from '@/store/modules/reference/plugin/type';
import type { ProviderReferenceItem, ProviderReferenceMap } from '@/store/modules/reference/provider/type';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceItems, CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';

import { DASHBOARD_SERVICE_LABELS } from '@/services/dashboards/constants/dashboard-labels';


export interface FilterLabelItem {
    label: string;
    name: string;
    image?: string;
}

const emit = defineEmits<{(e:'select-label', labels: FilterLabelItem[]):void;
    (e:'select-provider', plugins: FilterLabelItem[]):void;
    (e:'select-plugin', plugins: PluginReferenceItem[]):void;
}>();

const allReferenceStore = useAllReferenceStore();


const state = reactive({
    providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
    providerList: computed(() => (Object.values(state.providers) as ProviderReferenceItem[]).map((provider) => ({
        label: provider.name,
        name: provider.key,
        image: provider.icon,
    }))),
    services: computed(() => Object.values(DASHBOARD_SERVICE_LABELS)),
    serviceList: computed(() => state.services.map((service) => ({
        label: service,
        name: service,
        image: null,
    }))),
    selectedProviders: [],
    selectedServices: [],
});

const pluginState = reactive({
    plugins: computed<PluginReferenceMap>(() => store.getters['reference/pluginItems']),
    costDataSources: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
    pluginList: computed(() => {
        const costDataSourceList: CostDataSourceItems[] = Object.values(pluginState.costDataSources) as CostDataSourceItems[];
        const costPluginList = costDataSourceList.reduce((acc, current) => {
            if (!acc.find((pluginInfo) => pluginInfo.name === current.data.plugin_info.plugin_id)) {
                const pluginId = current.data.plugin_info.plugin_id;
                const plugin = pluginState.plugins[pluginId];
                acc.push({
                    name: pluginId,
                    label: plugin.name,
                    image: plugin.icon,
                });
            }
            return acc;
        }, [] as FilterLabelItem[]);
        const assetPluginIdList = [
            'plugin-prowler-inven-collector',
            'plugin-dclo-inven-collector',
        ];
        const assetPluginList = [] as FilterLabelItem[];
        assetPluginIdList.forEach((pluginId) => {
            const plugin = pluginState.plugins[pluginId];
            if (!plugin) return;
            assetPluginList.push({
                name: pluginId,
                label: plugin.name,
                image: plugin.icon,
            });
        });

        return [...costPluginList, ...assetPluginList];
    }),
    selectedPlugins: [] as PluginReferenceItem[],
});

const handleChangeLabelFilter = (selected: FilterLabelItem[]) => {
    state.selectedServices = selected;
    emit('select-label', selected);
};

const handleChangeProviderFilter = (selected: FilterLabelItem[]) => {
    state.selectedProviders = selected;
    emit('select-provider', selected);
};

const handleChangePluginFilter = (selected: PluginReferenceItem[]) => {
    pluginState.selectedPlugins = selected;
    emit('select-plugin', selected);
};

</script>
<template>
    <div class="dashboard-create-step-1-search-filter">
        <div class="label-container">
            <div class="label">
                <p-field-title class="title">
                    Plugin
                </p-field-title>
                <p-checkbox-group direction="vertical">
                    <p-checkbox v-for="plugin in pluginState.pluginList"
                                :key="plugin.name"
                                class="label-item"
                                :selected="pluginState.selectedPlugins"
                                :value="plugin"
                                @change="handleChangePluginFilter"
                    >
                        <div class="content-menu-item">
                            <p-lazy-img width="1.25rem"
                                        height="1.25rem"
                                        error-icon="ic_cloud-filled"
                                        :src="plugin.image"
                                        class="mr-1"
                            />{{ plugin.label }}
                        </div>
                    </p-checkbox>
                </p-checkbox-group>
            </div>
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
                                @change="handleChangeProviderFilter"
                    >
                        <div class="content-menu-item">
                            <p-lazy-img width="1.25rem"
                                        height="1.25rem"
                                        error-icon="ic_cloud-filled"
                                        :src="provider.image"
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
                                @change="handleChangeLabelFilter"
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
                               show-select-marker
                               :show-delete-all-button="false"
                               :menu="state.providerList"
                               :selected="state.selectedProviders"
                               @update:selected="handleChangeProviderFilter"
            >
                <template #menu-item--format="{item}">
                    <p-lazy-img width="1rem"
                                height="1rem"
                                error-icon="ic_cloud-filled"
                                :src="item.image"
                                class="mr-1"
                    />{{ item.label }}
                </template>
            </p-select-dropdown>
            <p-select-dropdown multi-selectable
                               style-type="rounded"
                               appearance-type="badge"
                               selection-label="Service"
                               show-select-marker
                               :show-delete-all-button="false"
                               :menu="state.serviceList"
                               :selected="state.selectedServices"
                               @update:selected="handleChangeLabelFilter"
            />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-create-step-1-search-filter {

    .label-container {
        width: 14.125rem;
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
