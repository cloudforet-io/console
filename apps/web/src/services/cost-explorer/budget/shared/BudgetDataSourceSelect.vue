<script setup lang="ts">

import { reactive, watch } from 'vue';

import { PFieldGroup, PSelectDropdown } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';


import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import type { DataSourceInfoModel } from '@/services/cost-explorer/model';

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

const state = reactive({
    dataSourceItems: [] as MenuItem[],
});

watch([() => selectedDataSource.value, () => isAllValid.value], ([dataSource, isValid]) => {
    emit('update', dataSource, isValid);
}, { immediate: true });

const fetchDataSource = async () => {
    try {
        const { results } = await SpaceConnector.clientV2.costAnalysis.dataSource.list();

        const dataSourceItems: MenuItem[] = results.map((dataSource:DataSourceInfoModel) => ({
            name: dataSource.data_source_id,
            label: dataSource.name,
        }));

        state.dataSourceItems = dataSourceItems;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.dataSourceItems = [];
        setForm('selectedDataSource', null);
    }
};

(async () => {
    await fetchDataSource();
    setForm('selectedDataSource', state.dataSourceItems[0]?.name);
})();

</script>

<template>
    <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.DATA_SOURCE')"
                   :invalid="!selectedDataSource"
                   required
                   class="budget-data-source-select-field"
    >
        <p-select-dropdown class="data-source-dropdown"
                           :items="state.dataSourceItems"
                           :selected="selectedDataSource"
                           @update:selected="setForm('selectedDataSource', $event)"
        />
    </p-field-group>
</template>


<style lang="postcss" scoped>
.budget-data-source-select-field {
    width: 30rem;
    .data-source-dropdown {
        width: 100%;
    }
}

@screen mobile {
    .budget-data-source-select-field {
        width: 100%;
    }
}
</style>
