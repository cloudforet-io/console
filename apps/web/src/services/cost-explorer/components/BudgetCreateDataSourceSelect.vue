<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { PFieldGroup, PSelectDropdown, PLazyImg } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { store } from '@/store';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import type { PluginReferenceMap } from '@/store/modules/reference/plugin/type';
import { CURRENCY, CURRENCY_SYMBOL } from '@/store/modules/settings/config';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap, DataSourceItems } from '@/store/reference/cost-data-source-reference-store';

import { useFormValidator } from '@/common/composables/form-validator';


interface Props {
    workspaceId?: string;
}
const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update', dataSource: string|null, isValid: boolean): void; }>();

const {
    forms: {
        selectedDataSource,
    },
    setForm,
    isAllValid,
} = useFormValidator({
    selectedDataSource: null as string|null,
}, {
    selectedDataSource(value: string|null) { return !!value; },
});

const allReferenceStore = useAllReferenceStore();
const appContextStore = useAppContextStore();
const storeState = reactive({
    isAdminMode: computed<boolean>(() => appContextStore.getters.isAdminMode),
    plugins: computed<PluginReferenceMap>(() => store.getters['reference/pluginItems']),
    costDataSource: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
});
const state = reactive({
    dataSourceItems: computed<MenuItem[]>(() => {
        if (storeState.isAdminMode && !props.workspaceId) return [];
        let _costDataSourceList = Object.entries(storeState.costDataSource);
        if (storeState.isAdminMode) {
            _costDataSourceList = Object.entries(storeState.costDataSource).filter(([, v]) => v.data.workspace_id === props.workspaceId);
        }
        return _costDataSourceList.map(([key, dataSource]) => ({
            name: key,
            label: dataSource.label,
            imageUrl: storeState.plugins[dataSource.data.plugin_info.plugin_id]?.icon ? storeState.plugins[dataSource.data.plugin_info.plugin_id]?.icon : 'error',
        }));
    }),
});

watch([() => selectedDataSource.value, () => isAllValid.value], ([dataSource, isValid]) => {
    emit('update', dataSource, isValid);
}, { immediate: true });

const getCurrencyFromDataSource = (dataSourceId: string) => {
    if (!storeState.costDataSource) return '';
    const dataSourceItem:DataSourceItems = storeState.costDataSource[dataSourceId];
    const currency = dataSourceItem?.data.plugin_info.metadata?.currency ?? CURRENCY.USD;
    return CURRENCY_SYMBOL[currency] + CURRENCY[currency];
};

watch(() => state.dataSourceItems, async (val) => {
    if (val.length) setForm('selectedDataSource', val[0]?.name);
});
</script>

<template>
    <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.DATA_SOURCE')"
                   :invalid="!selectedDataSource"
                   required
                   class="budget-create-data-source-select-field"
    >
        <p-select-dropdown class="data-source-dropdown"
                           :menu="state.dataSourceItems"
                           :selected="selectedDataSource"
                           is-fixed-width
                           @update:selected="setForm('selectedDataSource', $event)"
        >
            <template #dropdown-button="item">
                <div class="selected-input">
                    <p-lazy-img :src="item?.imageUrl"
                                class="left-icon"
                                width="1rem"
                                height="1rem"
                    /><span>{{ item?.label }}</span> <span class="selected-item-postfix">(Currency: {{ getCurrencyFromDataSource(item?.name) }})</span>
                </div>
            </template>
            <template #menu-item--format="{item}">
                <div class="menu-item">
                    <span>{{ item?.label }}</span> <span class="selected-item-postfix">(Currency: {{ getCurrencyFromDataSource(item?.name) }})</span>
                </div>
            </template>
        </p-select-dropdown>
    </p-field-group>
</template>


<style lang="postcss" scoped>
.budget-create-data-source-select-field {
    width: 30rem;
    .data-source-dropdown {
        width: 100%;
        .selected-input {
            @apply flex items-center gap-1;
        }
        .selected-item-postfix {
            @apply text-gray-400;
        }
        .left-icon {
            flex-shrink: 0;
        }
    }
}

@screen mobile {
    .budget-create-data-source-select-field {
        width: 100%;
    }
}
</style>
