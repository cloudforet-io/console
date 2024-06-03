<script setup lang="ts">

import { computed, reactive } from 'vue';

import {
    PFieldGroup, PDivider, PIconButton, PTextButton, PButton, PRadioGroup, PRadio,
} from '@spaceone/design-system';

import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type { DataTableModel } from '@/common/modules/widgets/types/widget-model';

import { gray, violet } from '@/styles/colors';

interface Props {
    item: DataTableModel;
}

const props = defineProps<Props>();
const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateGetters = widgetGenerateStore.getters;

const state = reactive({
    selected: computed(() => widgetGenerateGetters.selectedDataTableId === props.item.data_table_id),
    dataFormatItems: computed(() => [
        { label: 'Time-series', value: 'time-series' },
        { label: 'Accumulated', value: 'accumulated' },
    ]),
    selectedDataFormat: 'time-series',
    selectedDataTable: undefined as string | undefined,
});

/* Events */
const handleSelectDataTable = async (dataTableId: string) => {
    widgetGenerateStore.setSelectedDataTable(dataTableId);
    await widgetGenerateStore.loadDataTable(dataTableId);
};
const handleSelectDataFormat = (dataFormat: string) => {
    state.selectedDataFormat = dataFormat;
};

</script>

<template>
    <div class="widget-form-data-source-card">
        <div class="card-wrapper"
             :class="{ 'selected': state.selected }"
        >
            <div class="card-header">
                <div class="title-wrapper">
                    <div class="title">
                        <p-icon-button class="selected-radio-icon"
                                       :name="state.selected ? 'ic_checkbox-circle-selected' : 'ic_radio'"
                                       :color="state.selected ? violet[500] : gray[400]"
                                       size="sm"
                                       @click="handleSelectDataTable(props.item.data_table_id)"
                        />
                        <p>Data Source 1</p>
                        <p-icon-button class="edit-button"
                                       style-type="transparent"
                                       name="ic_edit-text"
                                       size="sm"
                        />
                    </div>
                    <p-text-button class="delete-button"
                                   icon-left="ic_delete"
                    >
                        Delete
                    </p-text-button>
                </div>
            </div>
            <div class="options-form">
                <p-field-group label="Group by" />
                <p-field-group label="Data Format"
                               required
                >
                    <p-radio-group>
                        <p-radio v-for="dataFormat in state.dataFormatItems"
                                 :key="dataFormat.value"
                                 :selected="state.selectedDataFormat"
                                 :value="dataFormat.value"
                                 class="provider-item"
                                 @change="handleSelectDataFormat"
                        >
                            {{ dataFormat.label }}
                        </p-radio>
                    </p-radio-group>
                </p-field-group>
                <p-divider class="filter-divider" />
                <p-button style-type="tertiary"
                          icon-left="ic_plus_bold"
                          block
                >
                    Add Filter
                </p-button>
                <p-button class="save-changes-button"
                          style-type="secondary"
                >
                    Save Changes
                </p-button>
            </div>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.widget-form-data-source-card {
    @apply relative flex;

    .card-wrapper {
        @apply relative border border-gray-300 rounded-lg w-full;
        width: 24rem;
        overflow: hidden;
        &.selected {
            @apply border-violet-600;
            box-shadow: 0 0 0 0.1875rem rgba(137, 124, 214, 0.6);
        }

        .card-header {
            @apply bg-gray-100;
            height: 4.5rem;
            padding: 0.5rem 0.75rem;

            .title-wrapper {
                @apply flex items-center justify-between;
                .title {
                    @apply text-paragraph-sm font-bold flex items-center;
                    gap: 0.125rem;
                }
            }
        }
        .options-form {
            @apply bg-white;
            padding: 0.75rem;

            .filter-divider {
                margin: 0.75rem 0;
            }
        }
        .save-changes-button {
            @apply relative;
            margin-top: 0.75rem;
        }
    }

    .add-data-source-floating-button {
        @apply flex items-center justify-center;
        width: 4rem;
        height: 4rem;

        .add-button {
            @apply relative flex items-center justify-center border border-violet-400 bg-violet-300 rounded-full;
            width: 2.5rem;
            height: 2.5rem;

            &::before {
                @apply bg-violet-400;
                content: '';
                position: absolute;
                left: -0.8125rem;
                top: 50%;
                transform: translateY(-50%);
                width: 0.75rem;
                height: 0.0625rem;
            }
        }
    }
}
</style>
