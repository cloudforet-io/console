<script setup lang="ts">

import { reactive, watch } from 'vue';

import { PFieldGroup, PSelectDropdown, PLazyImg } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';


import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import type { DataSourceModel } from '@/services/cost-explorer/model';

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

        const dataSourceItems: MenuItem[] = results.map((dataSource:DataSourceModel) => ({
            name: dataSource.data_source_id,
            label: dataSource.name,
            imageUrl: 'https://spaceone-custom-assets.s3.ap-northeast-2.amazonaws.com/console-assets/icons/aws-ec2.svg',
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
                           is-fixed-width
                           @update:selected="setForm('selectedDataSource', $event)"
        >
            <template #default="{ item }">
                <!--TODO: Currency should be changed to real data.-->
                <div class="selected-input">
                    <p-lazy-img :src="item.imageUrl"
                                width="1rem"
                                height="1rem"
                    /><span>{{ item.label }}</span> <span class="selected-item-postfix">(Currency: ₩KRW)</span>
                </div>
            </template>
            <template #menu-item--format="{item}">
                <div class="menu-item">
                    <!--TODO: Currency should be changed to real data.-->
                    <span>{{ item.label }}</span> <span class="selected-item-postfix">(Currency: ₩KRW)</span>
                </div>
            </template>
        </p-select-dropdown>
    </p-field-group>
</template>


<style lang="postcss" scoped>
.budget-data-source-select-field {
    width: 30rem;
    .data-source-dropdown {
        width: 100%;
        .selected-input {
            @apply flex items-center gap-1;
        }
        .selected-item-postfix {
            @apply text-gray-400;
        }
    }
}

@screen mobile {
    .budget-data-source-select-field {
        width: 100%;
    }
}
</style>
