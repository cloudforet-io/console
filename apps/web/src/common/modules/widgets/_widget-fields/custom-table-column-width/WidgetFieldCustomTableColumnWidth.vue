<script lang="ts" setup>
import {
    computed,
    onMounted, reactive, watch,
} from 'vue';

import { sortBy } from 'lodash';

import {
    PFieldTitle, PTextInput, PIconButton, PButton, PSelectDropdown, PToggleButton,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';



import getRandomId from '@/lib/random-id-generator';

import { useProxyValue } from '@/common/composables/proxy-state';
import type { CustomColumnWidthItem, CustomTableColumnWidthValue, CustomTableColumnWidthOptions } from '@/common/modules/widgets/_widget-fields/custom-table-column-width/type';
import type {
    WidgetFieldComponentEmit,
    WidgetFieldComponentProps,
} from '@/common/modules/widgets/types/widget-field-type';
import type {
} from '@/common/modules/widgets/types/widget-field-value-type';

interface CustomWidthFieldItem extends CustomColumnWidthItem {
    key: string;
}

const props = defineProps<WidgetFieldComponentProps<CustomTableColumnWidthOptions, CustomTableColumnWidthValue>>();
const emit = defineEmits<WidgetFieldComponentEmit<CustomTableColumnWidthValue>>();
const state = reactive({
    proxyValue: useProxyValue<CustomTableColumnWidthValue>('value', props, emit),
    // Custom
    customWidthItems: [] as CustomWidthFieldItem[],
    dataFieldType: computed(() => props.allValueMap?.tableDataField?.fieldType ?? 'dynamicField'),
    labelFieldList: computed<string[]>(() => (props.allValueMap?.groupBy?.value as string[]) ?? []),
    dataFieldList: computed<string[]>(() => {
        if (!props.allValueMap?.tableDataField?.value) return [];
        if (state.dataFieldType === 'dynamicField') return [props.allValueMap?.tableDataField?.value];
        return props.allValueMap?.tableDataField?.value as string[];
    }),
    allFieldList: computed<MenuItem[]>(() => {
        const allField = [...state.labelFieldList, ...state.dataFieldList, 'Sub Total'];
        return sortBy(allField.map((item) => ({
            name: item === 'Sub Total' ? 'sub_total' : item,
            label: item,
            disabled: state.customWidthItems.some((customWidthItem) => customWidthItem.fieldKey === item),
        })));
    }),
});

const convertAndApplyCustomWidthInfo = (value: CustomWidthFieldItem[]) => {
    const convertedValue = value.map((item) => ({
        fieldKey: item.fieldKey,
        width: item.width,
    }));
    state.proxyValue = {
        ...state.proxyValue,
        value: convertedValue,
    };
};
const checkValue = () => {
    if (state.proxyValue?.value?.length) {
        if (state.proxyValue.value.some((item) => item.fieldKey === undefined)) return false;
        if (state.proxyValue.value.some((item) => item.width === undefined || item.width === 0)) return false;
    }
    return true;
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

const handleUpdateToggle = (value: boolean) => {
    state.proxyValue = {
        toggleValue: value,
    };
    if (!value) {
        state.proxyValue = undefined;
    }
};

watch(() => props.value, (changed) => {
    if (changed === undefined) {
        state.proxyValue = {
            toggleValue: false,
        };
        state.customWidthItems = [];
        emit('update:is-valid', true);
    } else emit('update:is-valid', checkValue());
});


onMounted(() => {
    emit('update:is-valid', true);
    if (props.value?.toggleValue) {
        state.proxyValue = {
            toggleValue: props.value.toggleValue,
            value: props.value?.value ?? [],
        };
        state.customWidthItems = state.proxyValue.value.map((item) => ({
            key: getRandomId(),
            fieldKey: item.fieldKey,
            width: item.width,
        }));
    } else {
        state.proxyValue = {
            toggleValue: false,
        };
    }
});


</script>

<template>
    <div class="widget-field-custom-table-column-width">
        <div class="field-header">
            <p-field-title>{{ $t('COMMON.WIDGETS.CUSTOM_TABLE_COLUMN_WIDTH.CUSTOM_TABLE_COLUMN_WIDTH') }}</p-field-title>
            <p-toggle-button :value="state.proxyValue?.toggleValue"
                             @update:value="handleUpdateToggle"
            />
        </div>
        <p class="description">
            {{ $t('COMMON.WIDGETS.CUSTOM_TABLE_COLUMN_WIDTH.DESCRIPTION') }}
        </p>
        <div v-if="state.proxyValue?.toggleValue"
             class="field-contents-wrapper"
        >
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

    input {
        width: 100%;
    }
    .input-container {
        padding-right: 1.5rem;
    }
}
</style>
