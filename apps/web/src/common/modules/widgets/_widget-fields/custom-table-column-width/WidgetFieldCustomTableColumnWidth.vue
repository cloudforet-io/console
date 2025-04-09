<script lang="ts" setup>
import {
    computed,
    onMounted, reactive,
} from 'vue';


import {
    PFieldTitle, PTextInput, PIconButton, PButton, PSelectDropdown,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';



import getRandomId from '@/lib/random-id-generator';

import type {
} from '@/common/modules/widgets/types/widget-field-value-type';
import { useWidgetDataTableListQuery } from '@/common/modules/widgets/_composables/use-widget-data-table-list-query';
import { DATA_TABLE_OPERATOR } from '@/common/modules/widgets/_constants/data-table-constant';
import { SUB_TOTAL_NAME } from '@/common/modules/widgets/_constants/widget-field-constant';
import { sortWidgetTableFields } from '@/common/modules/widgets/_helpers/widget-helper';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type {
    CustomColumnWidthItem,
    CustomTableColumnWidthValue,
} from '@/common/modules/widgets/_widget-fields/custom-table-column-width/type';
import type { DataTableModel } from '@/common/modules/widgets/types/widget-data-table-type';
import type {
    WidgetFieldComponentProps,
} from '@/common/modules/widgets/types/widget-field-type';


interface CustomWidthFieldItem extends CustomColumnWidthItem {
    key: string;
}
const FIELD_KEY = 'customTableColumnWidth';

const props = defineProps<WidgetFieldComponentProps<undefined>>();
const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;

/* Query */
const {
    dataTableList,
} = useWidgetDataTableListQuery({
    widgetId: computed(() => widgetGenerateState.widgetId),
});

const state = reactive({
    selectedDataTable: computed<DataTableModel|undefined>(() => dataTableList.value.find((d) => d.data_table_id === widgetGenerateState.selectedDataTableId)),
    isPivotDataTable: computed<boolean>(() => state.selectedDataTable?.operator === DATA_TABLE_OPERATOR.PIVOT),
    fieldValue: computed<CustomTableColumnWidthValue>(() => props.fieldManager.data[FIELD_KEY].value),
    customWidthItems: [] as CustomWidthFieldItem[],
    allFieldList: computed<MenuItem[]>(() => {
        if (!state.selectedDataTable) return [];

        const columnFieldForPivot = state.selectedDataTable?.options.PIVOT?.fields?.column;

        const fieldList = sortWidgetTableFields(
            [
                ...Object.keys(state.selectedDataTable?.labels_info ?? {}),
                ...((state.isPivotDataTable && columnFieldForPivot) ? [columnFieldForPivot, SUB_TOTAL_NAME] : Object.keys(state.selectedDataTable?.data_info ?? {})),
            ],
        ) ?? [];
        return fieldList.map((d) => ({
            name: d,
            label: d,
            disabled: state.customWidthItems.some((customWidthItem) => customWidthItem.fieldKey === d),
        }));
    }),
});

const convertAndApplyCustomWidthInfo = (value: CustomWidthFieldItem[]) => {
    const convertedValue = value.map((item) => ({
        fieldKey: item.fieldKey,
        width: item.width,
    }));

    props.fieldManager.setFieldValue(FIELD_KEY, {
        widthInfos: convertedValue,
    });
};

/* Event */
const handleClickAddCustomFieldWidth = () => {
    const newCustomWidthItem = {
        fieldKey: undefined,
        width: undefined,
    };
    state.customWidthItems = [
        ...state.customWidthItems,
        {
            ...newCustomWidthItem,
            key: getRandomId(),
        },
    ];
    convertAndApplyCustomWidthInfo(state.customWidthItems);
};
const handleRemoveCustomFieldWidth = (key: string) => {
    state.customWidthItems = state.customWidthItems.filter((_item) => _item.key !== key);
    convertAndApplyCustomWidthInfo(state.customWidthItems);
};
const handleSelectCustomFieldKey = (key: string, value: string) => {
    state.customWidthItems = state.customWidthItems.map((item) => {
        if (item.key === key) {
            return {
                ...item,
                fieldKey: value,
            };
        }
        return item;
    });
    convertAndApplyCustomWidthInfo(state.customWidthItems);
};
const handleChangeCustomFieldWidth = (key: string, value: number) => {
    state.customWidthItems = state.customWidthItems.map((item) => {
        if (item.key === key) {
            return {
                ...item,
                width: value,
            };
        }
        return item;
    });
    convertAndApplyCustomWidthInfo(state.customWidthItems);
};


onMounted(() => {
    state.customWidthItems = state.fieldValue.widthInfos.map((item) => ({
        key: getRandomId(),
        fieldKey: item.fieldKey,
        width: item.width,
    }));
});


</script>

<template>
    <div class="widget-field-custom-table-column-width">
        <div class="field-header">
            <p-field-title>{{ $t('COMMON.WIDGETS.CUSTOM_TABLE_COLUMN_WIDTH.CUSTOM_TABLE_COLUMN_WIDTH') }}</p-field-title>
        </div>
        <p class="description">
            {{ $t('COMMON.WIDGETS.CUSTOM_TABLE_COLUMN_WIDTH.DESCRIPTION') }}
        </p>
        <div class="field-contents-wrapper">
            <div class="contents-box">
                <div v-if="state.customWidthItems.length"
                     class="field-title-wrapper"
                >
                    <p-field-title class="field-title"
                                   :label="$t('COMMON.WIDGETS.CUSTOM_TABLE_COLUMN_WIDTH.FIELD')"
                                   size="sm"
                                   color="gray"
                                   inline
                    />
                    <p-field-title class="width-title"
                                   :label="$t('COMMON.WIDGETS.CUSTOM_TABLE_COLUMN_WIDTH.WIDTH')"
                                   size="sm"
                                   color="gray"
                                   inline
                    />
                </div>
                <div v-for="(customWidthInfo) in state.customWidthItems"
                     :key="customWidthInfo.key"
                     class="item-wrapper"
                >
                    <div class="item-set">
                        <p-select-dropdown :menu="state.allFieldList"
                                           class="field-dropdown"
                                           :selected="customWidthInfo.fieldKey"
                                           :invalid="!customWidthInfo.fieldKey"
                                           @select="handleSelectCustomFieldKey(customWidthInfo.key, $event)"
                        />
                        <p-text-input class="field-width-input"
                                      block
                                      type="number"
                                      :value="customWidthInfo.width"
                                      :invalid="!customWidthInfo.width"
                                      @update:value="handleChangeCustomFieldWidth(customWidthInfo.key, $event)"
                        />
                        <p-icon-button name="ic_delete"
                                       size="sm"
                                       @click="handleRemoveCustomFieldWidth(customWidthInfo.key)"
                        />
                    </div>
                    <!--                    <p v-if="validationState.additionalFieldInvalidMap[labelInfo.key]"-->
                    <!--                       class="invalid-text"-->
                    <!--                    >-->
                    <!--                        {{ getAdditionalLabelInvalidText(labelInfo.key, labelInfo.name) }}-->
                    <!--                    </p>-->
                </div>
                <p-button style-type="tertiary"
                          icon-left="ic_plus_bold"
                          @click="handleClickAddCustomFieldWidth"
                >
                    {{ $t('COMMON.WIDGETS.CUSTOM_TABLE_COLUMN_WIDTH.ADD') }}
                </p-button>
            </div>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.widget-field-custom-table-column-width {
    .field-header {
        @apply flex items-center gap-1 justify-between;
    }
    .description {
        @apply text-paragraph-sm text-gray-900;
        margin: 0.25rem 0 0.75rem;
    }
    .field-contents-wrapper {

        .contents-box {
            @apply bg-gray-100 rounded-lg;
            padding: 0.5rem;

            .field-title-wrapper {
                margin-bottom: 0.25rem;
                .field-title {
                    width: calc(100% - 9.25rem);
                }
            }
            .item-wrapper {
                margin-bottom: 0.5rem;
                .item-set {
                    @apply flex gap-1 items-center;
                    .field-dropdown {
                        width: calc(100% - 8rem);
                    }
                    .field-width-input {
                        width: 7.5rem;
                    }
                }
                .invalid-text {
                    @apply text-label-sm text-red-500;
                    margin-top: 0.25rem;
                }
            }
        }
    }
}

/* custom design-system component - p-text-input */
:deep(.p-text-input) {
    width: 7.5rem;

    .input-container {
        padding-right: 1.5rem;
    }
}
</style>
