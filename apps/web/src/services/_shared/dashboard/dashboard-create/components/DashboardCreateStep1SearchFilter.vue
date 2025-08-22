<script setup lang="ts">
import { computed, reactive } from 'vue';

import { uniq } from 'lodash';

import {
    PFieldTitle, PCheckboxGroup, PCheckbox, PLazyImg, PSelectDropdown,
} from '@cloudforet/mirinae';


import { useProviderList } from '@/services/_shared/dashboard/dashboard-create/composables/use-provider-list';
import { DASHBOARD_LABELS } from '@/services/_shared/dashboard/dashboard-create/constants/dashboard-labels';
import type { FilterLabelItem } from '@/services/_shared/dashboard/dashboard-create/types/dashboard-create-filter-type';

interface Props {
    labels: string[];
}

interface Emits {
    (e:'select-label', labels: FilterLabelItem[]):void;
    (e:'select-provider', providers: FilterLabelItem[]):void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { providerList, loading } = useProviderList();

const state = reactive({
    labels: computed(() => Object.values(DASHBOARD_LABELS)),
    labelList: computed(() => uniq([...state.labels, ...props.labels]).map((label) => ({
        label,
        name: label,
        image: null,
    }))),
    selectedProviders: [],
    selectedLabels: [],
});

const handleChangeLabelFilter = (selected: FilterLabelItem[]) => {
    state.selectedLabels = selected;
    emit('select-label', selected);
};

const handleChangeProviderFilter = (selected: FilterLabelItem[]) => {
    state.selectedProviders = selected;
    emit('select-provider', selected);
};
</script>
<template>
    <div class="dashboard-create-step-1-search-filter">
        <div class="label-container">
            <div v-if="!loading"
                 class="label"
            >
                <p-field-title class="title">
                    {{ $t('DASHBOARDS.CREATE.TEMPLATE.FILTER_PROVIDER') }}
                </p-field-title>
                <p-checkbox-group direction="vertical">
                    <p-checkbox v-for="provider in providerList"
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
                                        class="content-icon"
                            />
                            {{ provider.label }}
                        </div>
                    </p-checkbox>
                </p-checkbox-group>
            </div>
            <div class="label">
                <p-field-title class="title">
                    {{ $t('DASHBOARDS.CREATE.TEMPLATE.FILTER_LABEL') }}
                </p-field-title>
                <p-checkbox-group direction="vertical">
                    <p-checkbox v-for="service in state.labelList"
                                :key="service.name"
                                class="label-item"
                                :selected="state.selectedLabels"
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
                               :loading="loading"
                               :show-delete-all-button="false"
                               :menu="providerList"
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
                               selection-label="Label"
                               show-select-marker
                               :show-delete-all-button="false"
                               :menu="state.labelList"
                               :selected="state.selectedLabels"
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

            /* custom design-system component - p-checkbox */
            :deep(.p-checkbox) {
                @apply flex;
                .check-icon {
                    min-width: 1.25rem;
                }
                .text {
                    @apply flex-grow;
                }
            }

            .label-item {
                .content-menu-item {
                    @apply inline-flex text-label-md;
                    margin-left: 0.25rem;
                    .content-icon {
                        min-width: 1.25rem;
                        margin-right: 0.25rem;
                    }
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
